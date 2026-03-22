// /api/sendAlert.js
import nodemailer from "nodemailer";

// Use environment variables for security
const EMAIL_USER = process.env.VICTIM_EMAIL;        // victim's Gmail
const EMAIL_PASS = process.env.VICTIM_APP_PASSWORD; // Gmail App Password

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Vercel serverless function handler
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, msg: "Only POST allowed" });
  }

  const { message, contacts } = req.body;

  if (!contacts || contacts.length === 0) {
    return res.status(400).json({ success: false, msg: "No contacts provided" });
  }

  try {
    // Send email to each trusted contact
    for (const email of contacts) {
      await transporter.sendMail({
        from: EMAIL_USER,
        to: email,
        subject: "🚨 SOS Alert!",
        html: `
          <h1>SOS ALERT!</h1>
          <p>${message}</p>
        `
      });
    }

    return res.status(200).json({ success: true, msg: "Emails sent to all contacts" });
  } catch (err) {
    console.error("Error sending emails:", err);
    return res.status(500).json({ success: false, msg: "Error sending emails" });
  }
}
