const axios = require('axios');
const fs = require('fs');
const path = require('path');

const TARGET_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const REPORT_DIR = path.join(__dirname, '../monitoring-reports');
const REPORT_FILE = path.join(REPORT_DIR, 'performance-report.md');

async function runPerformanceMonitor() {
    console.log(`[Performance Monitor] Measuring response time for ${TARGET_URL}...`);
    const startTime = process.hrtime.bigint();

    try {
        const response = await axios.get(TARGET_URL, { timeout: 10000 });
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1_000_000; // Convert nanoseconds to milliseconds

        const status = response.status;
        const message = `[Performance Monitor] SUCCESS: ${TARGET_URL} responded in ${durationMs.toFixed(2)} ms (Status: ${status})`;
        console.log(message);

        // Append to a markdown report
        if (!fs.existsSync(REPORT_DIR)) {
            fs.mkdirSync(REPORT_DIR, { recursive: true });
        }
        const timestamp = new Date().toISOString();
        const reportEntry = `## Performance Report - ${timestamp}\n\n- URL: ${TARGET_URL}\n- Status: ${status}\n- Response Time: ${durationMs.toFixed(2)} ms\n\n`;
        fs.appendFileSync(REPORT_FILE, reportEntry);
        console.log(`[Performance Monitor] Report updated: ${REPORT_FILE}`);

    } catch (error) {
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1_000_000;
        const message = `[Performance Monitor] ERROR: ${TARGET_URL} failed after ${durationMs.toFixed(2)} ms. Details: ${error.message}`;
        console.error(message);

        // Append error to report
        if (!fs.existsSync(REPORT_DIR)) {
            fs.mkdirSync(REPORT_DIR, { recursive: true });
        }
        const timestamp = new Date().toISOString();
        const reportEntry = `## Performance Report - ${timestamp}\n\n- URL: ${TARGET_URL}\n- Status: FAILED\n- Error: ${error.message}\n- Attempt Duration: ${durationMs.toFixed(2)} ms\n\n`;
        fs.appendFileSync(REPORT_FILE, reportEntry);
        console.log(`[Performance Monitor] Report updated with error: ${REPORT_FILE}`);
    }
}

runPerformanceMonitor();