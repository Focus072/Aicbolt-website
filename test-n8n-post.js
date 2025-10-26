// Test script to simulate n8n POST request
const testData = {
  "place_id": "test_place_12345",
  "title": "Test Plumbing Company",
  "phone": "(555) 123-4567",
  "website": "https://testplumbing.com",
  "zipcode": "93308",
  "category_id": "1",
  "status": "new"
};

console.log('🧪 Testing n8n POST request simulation...');
console.log('Data to send:', JSON.stringify(testData, null, 2));

// Test the API endpoint
fetch('http://localhost:3000/api/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + (process.env.SCRAPER_API_KEY || 'test-key')
  },
  body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => {
  console.log('✅ API Response:', data);
})
.catch(error => {
  console.error('❌ API Error:', error);
});
