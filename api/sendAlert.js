// /api/sendAlert.js
const nodemailer = require("nodemailer");

const EMAIL_USER = process.env.SENDER_EMAIL;
const EMAIL_PASS = process.env.SENDER_APP_PASSWORD;

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, msg: "Only POST allowed" });
  }

  const { message, contacts, lat, lng } = req.body || {};

  if (!contacts || contacts.length === 0) {
    return res.status(400).json({ success: false, msg: "No contacts provided" });
  }

  const locationUrl = lat && lng
    ? `http://maps.google.com/maps?q=${lat},${lng}`
    : null;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: EMAIL_USER,
      to: contacts.join(","),
      subject: "🚨 SOS Alert!",
      html: `
        <h1 style="color:red;">🚨 SOS ALERT!</h1>
        <p>${message || "SOS! I need help. Please reach me immediately."}</p>
        ${locationUrl ? `<p>Location: <a href="${locationUrl}">${locationUrl}</a></p>` : ""}
        
      `
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ success: false, msg: "Error sending email" });
  }
};
