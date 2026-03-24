import nodemailer from 'nodemailer';
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });
}

const db = admin.firestore();

export default async function handler(req, res) {
    const { id, contact } = req.query;

    if (!id || !contact) {
        return res.status(400).json({ error: 'Missing event ID or contact name' });
    }

    try {
        // Get SOS event from Firestore
        const eventRef = db.collection('sos_events').doc(id);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            return res.status(404).json({ error: 'SOS event not found' });
        }

        // Update event in Firestore
        await eventRef.update({
            acknowledgedBy: contact,
            acknowledgedAt: Date.now(),
            status: 'ACKNOWLEDGED'
        });

        // Get all contacts from Firestore
        const contactsSnapshot = await db.collection('contacts').get();
        const contacts = [];
        contactsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.email) contacts.push(data);
        });

        // Setup nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SENDER_EMAIL,
                pass: process.env.SENDER_APP_PASSWORD,
            },
        });

        // Send email to victim
        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: process.env.VICTIM_EMAIL,
            subject: '✅ Help is on the way!',
            text: `Don't panic! ${contact} has seen your SOS and is on their way. Stay alert and stay safe.`,
        });

        // Send email to all other contacts
        for (const c of contacts) {
            if (c.email && c.name !== contact) {
                await transporter.sendMail({
                    from: process.env.SENDER_EMAIL,
                    to: c.email,
                    subject: '🚨 SOS Update',
                    text: `${contact} has acknowledged the SOS alert and is on their way to help. No further action needed from you unless ${contact} needs backup.`,
                });
            }
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Acknowledge error:', error);
        return res.status(500).json({ error: error.message });
    }
} 
