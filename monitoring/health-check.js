const axios = require('axios');
const nodemailer = require('nodemailer');

const TARGET_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const ALERT_EMAIL = process.env.ALERT_EMAIL;
const EMAIL_PASS = process.env.EMAIL_PASS; // App password for Gmail or similar

const transporter = ALERT_EMAIL && EMAIL_PASS ? nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: ALERT_EMAIL,
        pass: EMAIL_PASS,
    },
}) : null;

async function sendAlert(subject, text) {
    if (transporter) {
        try {
            await transporter.sendMail({
                from: ALERT_EMAIL,
                to: ALERT_EMAIL, // Send to self for simplicity
                subject: `[AICBOLT Health Alert] ${subject}`,
                text: text,
            });
            console.log(`Email alert sent: ${subject}`);
        } catch (error) {
            console.error('Failed to send email alert:', error);
        }
    } else {
        console.warn('Email transporter not configured. Skipping email alert.');
    }
}

async function runHealthCheck() {
    console.log(`[Health Check] Pinging ${TARGET_URL}...`);
    try {
        const response = await axios.get(TARGET_URL, { timeout: 5000 });
        if (response.status === 200) {
            console.log(`[Health Check] SUCCESS: ${TARGET_URL} is up. Status: ${response.status}`);
        } else {
            const message = `[Health Check] WARNING: ${TARGET_URL} returned status ${response.status}`;
            console.warn(message);
            await sendAlert('Website Health Warning', message);
        }
    } catch (error) {
        const message = `[Health Check] ERROR: ${TARGET_URL} is down or unreachable. Details: ${error.message}`;
        console.error(message);
        await sendAlert('Website Health Critical', message);
    }
}

runHealthCheck();