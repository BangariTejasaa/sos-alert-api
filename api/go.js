const admin = require("firebase-admin");
 
// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:    process.env.FIREBASE_PROJECT_ID,
      clientEmail:  process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:   process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}
 
const db = admin.firestore();
 
module.exports = async function handler(req, res) {
  const { id } = req.query;
 
  // ── Fallback Maps URL (Hyderabad center) if anything fails ──
  const FALLBACK = "https://www.google.com/maps";
 
  if (!id) {
    return res.redirect(302, FALLBACK);
  }
 
  try {
    const doc = await db.collection("sos_events").doc(id).get();
 
    if (!doc.exists) {
      return res.redirect(302, FALLBACK);
    }
 
    const data = doc.data();
    const lat  = data?.latitude;
    const lng  = data?.longitude;
 
    if (lat == null || lng == null) {
      return res.redirect(302, FALLBACK);
    }
 
    // Check if SOS is still active
    const status = data?.status;
    if (status === "STOPPED") {
      // Still show last known location but with a note in the label
      const stoppedUrl =
        `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` +
        `&query_place_id=SOS+Alert+(Resolved)`;
      return res.redirect(302, stoppedUrl);
    }
 
    // ── Active SOS — open navigation directly ──
    // travelmode=driving opens Maps app in navigation mode on mobile
    const mapsUrl =
      `https://www.google.com/maps/dir/?api=1` +
      `&destination=${lat},${lng}` +
      `&travelmode=driving`;
 
    // Cache-control: no-cache so every tap fetches fresh coords
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    return res.redirect(302, mapsUrl);
 
  } catch (err) {
    console.error("go.js error:", err);
    return res.redirect(302, FALLBACK);
  }
};
 
