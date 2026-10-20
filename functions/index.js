// Serveur de paiement de Mon Répertoire (Jukehub) — 19 oct. 2026.
//
// Modèle choisi par Hubert : plus de votes. Pour faire monter une chanson, le client paie le montant
// de son choix (2 $ à 100 $). La chanson qui a reçu le plus d'argent est en tête du palmarès.
//  - Au paiement, la carte est seulement AUTORISÉE (réservée), pas prélevée.
//  - Quand Hubert appuie sur « Jouée », les paiements de cette chanson sont PRÉLEVÉS.
//  - À « Nouvelle soirée » (ou si la chanson est « brûlée »), les réservations restantes sont ANNULÉES :
//    le client ne paie rien pour une chanson qui n'a pas été jouée.
//
// Le total d'une chanson est gardé, EN CENTS, dans le champ "requests" de votes/{id} — le champ
// qu'utilisait l'ancien système de votes. Le classement, la remise à 0 à « Jouée » et la logique
// des chansons « éteintes » fonctionnent donc sans changement côté appli. Seul ce serveur peut
// modifier ce champ (voir firestore.rules) : un client ne peut pas se donner de l'argent sans payer.
//
// Chaque paiement est aussi noté dans payments/{id du PaymentIntent Stripe}.

const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { defineSecret, defineString } = require("firebase-functions/params");
const admin = require("firebase-admin");
const Stripe = require("stripe");

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ region: "northamerica-northeast1", maxInstances: 5 });

// Clés Stripe : gardées dans le Secret Manager de Google, jamais dans le code.
const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");
// Courriel du compte admin (celui du panneau « Mode spectacle ») : seul lui peut prélever ou annuler.
const ADMIN_EMAIL = defineString("ADMIN_EMAIL");

const MIN_CENTS = 200;    // 2 $
const MAX_CENTS = 10000;  // 100 $
const SITE_URL = "https://myrepertoire.carrd.co/";

function stripeClient() {
  return new Stripe(STRIPE_SECRET_KEY.value());
}

// Même filtre que isHiddenFromPalmares() dans l'appli : brûlée, en refroidissement, ou « éteinte »
// (déjà jouée, refroidissement terminé, jamais redemandée).
function isActiveSong(v) {
  if (!v) return false;
  if (v.burned) return false;
  if (v.cooldownUntil && v.cooldownUntil > Date.now()) return false;
  const playedAt = v.playedAt && v.playedAt.toMillis ? v.playedAt.toMillis() : 0;
  if ((v.requests || 0) === 0 && playedAt > 0) return false;
  return true;
}

// Clé de la map "voters" (même nettoyage que sanitizeVoterKey() dans l'appli)
function voterKey(name) {
  return String(name || "").trim().slice(0, 15).replace(/[.$#\[\]/~*]/g, "_");
}

function requireAdmin(request) {
  const email = request.auth && request.auth.token && request.auth.token.email;
  if (!email || email.toLowerCase() !== ADMIN_EMAIL.value().toLowerCase()) {
    throw new HttpsError("permission-denied", "Réservé au panneau admin.");
  }
}

// ---------- 1. Créer la page de paiement Stripe ----------
// Appelée par l'appli quand le client choisit un montant. Répond { url } : l'adresse de la page
// de paiement Stripe, que l'appli ouvre en plein écran.
exports.createCheckout = onRequest(
  { secrets: [STRIPE_SECRET_KEY], cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "POST seulement" });
      return;
    }
    try {
      const { songId, amountCents, name } = req.body || {};
      const amount = Math.round(Number(amountCents));
      if (typeof songId !== "string" || !songId || songId.length > 100) {
        res.status(400).json({ error: "Chanson invalide" });
        return;
      }
      if (!Number.isFinite(amount) || amount < MIN_CENTS || amount > MAX_CENTS) {
        res.status(400).json({ error: "Montant invalide (2 $ à 100 $)" });
        return;
      }
      const [songSnap, settingsSnap] = await Promise.all([
        db.doc(`votes/${songId}`).get(),
        db.doc("config/settings").get(),
      ]);
      const song = songSnap.data();
      if (!isActiveSong(song)) {
        res.status(409).json({ error: "Cette chanson n'est plus au palmarès" });
        return;
      }
      const settings = settingsSnap.data() || {};
      if (!settings.live) {
        res.status(409).json({ error: "Le spectacle n'est pas commencé" });
        return;
      }
      const nightId = settings.nightId || "default";
      const cleanName = voterKey(name);
      const title = String(song.title || "").slice(0, 120);
      const metadata = { songId, nightId, name: cleanName };

      const session = await stripeClient().checkout.sessions.create({
        mode: "payment",
        locale: "fr-CA",
        // Carte seulement (Apple Pay et Google Pay passent par la carte) : les autres moyens activés par
        // défaut dans Stripe (Klarna, Bancontact, Pix…) ne conviennent pas à une réservation prélevée
        // seulement si la chanson est jouée.
        payment_method_types: ["card"],
        line_items: [{
          quantity: 1,
          price_data: {
            currency: "cad",
            unit_amount: amount,
            product_data: {
              name: `Faire monter « ${title} »`,
              description: "Prélevé seulement si la chanson est jouée ce soir.",
            },
          },
        }],
        payment_intent_data: {
          capture_method: "manual",
          description: `Mon Répertoire — ${title}`,
          metadata,
        },
        metadata,
        success_url: `${SITE_URL}#paid`,
        cancel_url: `${SITE_URL}#`,
      });
      res.json({ url: session.url });
    } catch (e) {
      console.error("createCheckout", e);
      // Le type et le message de Stripe (jamais la clé, que Stripe masque) aident à diagnostiquer
      res.status(500).json({
        error: "Erreur du serveur de paiement",
        detail: e && e.type ? `${e.type}: ${String(e.message || "").slice(0, 300)}` : undefined,
      });
    }
  }
);

// ---------- 2. Confirmation de Stripe (webhook) ----------
// Stripe appelle cette adresse quand un client a terminé son paiement. On vérifie la signature
// (pour être sûr que c'est bien Stripe), puis on ajoute le montant à la chanson.
exports.stripeWebhook = onRequest(
  { secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET] },
  async (req, res) => {
    const stripe = stripeClient();
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, req.headers["stripe-signature"], STRIPE_WEBHOOK_SECRET.value());
    } catch (e) {
      console.error("Signature Stripe invalide", e.message);
      res.status(400).send("Signature invalide");
      return;
    }
    if (event.type !== "checkout.session.completed") {
      res.json({ received: true });
      return;
    }
    try {
      const session = event.data.object;
      const piId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
      if (!piId) {
        res.json({ received: true });
        return;
      }
      const pi = await stripe.paymentIntents.retrieve(piId);
      if (pi.status !== "requires_capture") {
        res.json({ received: true });
        return;
      }
      const { songId, nightId, name } = pi.metadata || {};
      const amount = pi.amount;
      const songRef = db.doc(`votes/${songId}`);
      const payRef = db.doc(`payments/${piId}`);
      const settingsRef = db.doc("config/settings");

      const accepted = await db.runTransaction(async (tx) => {
        const [paySnap, songSnap, settingsSnap] = await Promise.all([tx.get(payRef), tx.get(songRef), tx.get(settingsRef)]);
        if (paySnap.exists) return "duplicate"; // Stripe peut envoyer le même événement deux fois
        const song = songSnap.data();
        const currentNight = (settingsSnap.data() || {}).nightId || "default";
        if (!isActiveSong(song) || currentNight !== nightId) {
          tx.set(payRef, {
            songId, nightId, name: name || "", amountCents: amount, status: "canceling",
            title: song?.title || "", createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          return "reject";
        }
        const update = { requests: admin.firestore.FieldValue.increment(amount) };
        if (name) update[`voters.${name}`] = admin.firestore.FieldValue.increment(amount);
        tx.update(songRef, update);
        tx.set(payRef, {
          songId, nightId, name: name || "", amountCents: amount, status: "authorized",
          title: song.title || "", createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return "ok";
      });

      if (accepted === "reject") {
        // Chanson jouée, brûlée ou soirée terminée entre-temps : on libère la carte tout de suite.
        await stripe.paymentIntents.cancel(piId);
        await payRef.update({ status: "canceled" });
      }
      res.json({ received: true });
    } catch (e) {
      console.error("stripeWebhook", e);
      res.status(500).send("Erreur"); // Stripe réessaiera plus tard
    }
  }
);

// Prélève ou annule toutes les réservations « autorisées » qui correspondent à la requête.
async function settlePayments(query, action) {
  const stripe = stripeClient();
  const snap = await query.get();
  let count = 0;
  let totalCents = 0;
  for (const d of snap.docs) {
    try {
      if (action === "capture") await stripe.paymentIntents.capture(d.id);
      else await stripe.paymentIntents.cancel(d.id);
      await d.ref.update({
        status: action === "capture" ? "captured" : "canceled",
        settledAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      count += 1;
      totalCents += d.data().amountCents || 0;
    } catch (e) {
      // Ex. réservation expirée chez Stripe (après environ 7 jours) : on le note et on continue.
      console.error(`${action} ${d.id}`, e.message);
      await d.ref.update({ status: "error", error: String(e.message).slice(0, 200) });
    }
  }
  return { count, totalCents };
}

// ---------- 3. « Jouée » : prélever les paiements de cette chanson ----------
exports.captureSong = onCall({ secrets: [STRIPE_SECRET_KEY] }, async (request) => {
  requireAdmin(request);
  const songId = request.data && request.data.songId;
  if (typeof songId !== "string" || !songId) throw new HttpsError("invalid-argument", "songId manquant");
  const q = db.collection("payments").where("songId", "==", songId).where("status", "==", "authorized");
  return settlePayments(q, "capture");
});

// ---------- 4. Annuler : une chanson (brûlée / retirée) ou toute la soirée ----------
exports.releaseSong = onCall({ secrets: [STRIPE_SECRET_KEY] }, async (request) => {
  requireAdmin(request);
  const songId = request.data && request.data.songId;
  if (typeof songId !== "string" || !songId) throw new HttpsError("invalid-argument", "songId manquant");
  const q = db.collection("payments").where("songId", "==", songId).where("status", "==", "authorized");
  return settlePayments(q, "cancel");
});

exports.releaseNight = onCall({ secrets: [STRIPE_SECRET_KEY] }, async (request) => {
  requireAdmin(request);
  const q = db.collection("payments").where("status", "==", "authorized");
  return settlePayments(q, "cancel");
});
