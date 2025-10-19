const axios = require('axios');
const nodemailer = require('nodemailer');

const TARGET_API_URL = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/non-existent` : 'http://localhost:3000/api/non-existent';
const ALERT_EMAIL = process.env.ALERT_EMAIL;
const EMAIL_PASS = process.env.EMAIL_PASS;

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
                to: ALERT_EMAIL,
                subject: `[AICBOLT Resilience Alert] ${subject}`,
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

async function runResilienceTest() {
    console.log(`[Resilience Test] Simulating API outage by calling ${TARGET_API_URL}...`);
    try {
        await axios.get(TARGET_API_URL, { timeout: 2000 });
        console.error(`[Resilience Test] ERROR: Unexpected success when calling a non-existent API. This might indicate a misconfiguration.`);
        await sendAlert('Resilience Test Failure', 'Non-existent API call unexpectedly succeeded.');
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.log(`[Resilience Test] SUCCESS: API outage simulated successfully (received 404 as expected).`);
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ERR_NETWORK') {
            console.log(`[Resilience Test] SUCCESS: API outage simulated successfully (connection error as expected).`);
        } else {
            console.warn(`[Resilience Test] WARNING: API outage simulation resulted in an unexpected error: ${error.message}`);
            await sendAlert('Resilience Test Warning', `API outage simulation resulted in an unexpected error: ${error.message}`);
        }
    }
}

runResilienceTest();