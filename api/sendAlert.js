import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  try {
    const { emails, lat, lng } = req.body;

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: emails,
      subject: "SOS Emergency Alert",
      text: `Victim is in danger. Location: https://maps.google.com/?q=${lat},${lng}`
    });

    res.status(200).json({ success: true });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
