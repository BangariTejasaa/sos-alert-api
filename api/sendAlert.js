// /api/sendAlert.js

const nodemailer = require("nodemailer");

// Environment variables
const EMAIL_USER = process.env.SENDER_EMAIL; 
const EMAIL_PASS = process.env.SENDER_APP_PASSWORD;
// Add this RIGHT AFTER the env variable declarations at the top
console.log("EMAIL_USER:", EMAIL_USER, "EMAIL_PASS:", EMAIL_PASS ? "SET" : "NOT SET");

module.exports = async function handler(req, res) {
  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, msg: "Only POST allowed" });
  }

  // Safe body parsing
  const { message, contacts } = req.body || {};

  if (!contacts || contacts.length === 0) {
    return res.status(400).json({ success: false, msg: "No contacts provided" });
  }

  try {
    // Create transporter INSIDE function (important for Vercel)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      }
    });

    // Send to all contacts at once
    await transporter.sendMail({
      from: EMAIL_USER,
      to: contacts.join(","),
      subject: "🚨 SOS Alert!",
      html: `
        <h1 style="color:red;">🚨 SOS ALERT!</h1>
        <p>${message || "I am in danger! Please help me!"}</p>
        <p><b>Sent from SOS app</b></p>
      `
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ success: false, msg: "Error sending email" });
  }
};
