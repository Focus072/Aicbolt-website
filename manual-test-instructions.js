// Simple test to add a lead manually and check if it appears in grouped view
const testLead = {
  "place_id": "manual_test_" + Date.now(),
  "title": "Manual Test Plumbing Co",
  "phone": "(555) 999-8888",
  "website": "https://manualtest.com",
  "zipcode": "93308",
  "category_id": "1",
  "status": "new"
};

console.log('🧪 Testing manual lead creation...');
console.log('Test data:', JSON.stringify(testLead, null, 2));

// Instructions for manual testing
console.log('\n📋 Manual Testing Steps:');
console.log('1. Open browser to http://localhost:3000/leads-grouped');
console.log('2. Open browser developer tools (F12)');
console.log('3. Go to Console tab');
console.log('4. Run this command to test the API:');
console.log(`
fetch('/api/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + '${process.env.SCRAPER_API_KEY || 'your-api-key'}'
  },
  body: JSON.stringify(${JSON.stringify(testLead)})
})
.then(r => r.json())
.then(d => console.log('API Response:', d))
.catch(e => console.error('Error:', e));
`);

console.log('\n5. Then refresh the grouped leads page to see if the new lead appears');
console.log('6. Check if you see "93308 - Plumber" with the new lead count');
