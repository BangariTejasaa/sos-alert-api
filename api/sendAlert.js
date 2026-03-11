import nodemailer from "nodemailer";

export default async function handler(req, res) {

  const { emails, lat, lng } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "yourmail@gmail.com",
      pass: "your_app_password"
    }
  });

  await transporter.sendMail({
    from: "yourmail@gmail.com",
    to: emails,
    subject: "SOS Emergency Alert",
    text: `Victim is in danger. Location: https://maps.google.com/?q=${lat},${lng}`
  });

  res.status(200).json({ success: true });
}
