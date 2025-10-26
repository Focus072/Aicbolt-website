// Test script to verify grouped leads API is working
const testData = {
  "place_id": "test_local_" + Date.now(),
  "title": "Local Test Plumbing Co",
  "phone": "(555) 123-4567",
  "website": "https://localtest.com",
  "zipcode": "93308",
  "category_id": "1",
  "status": "new"
};

console.log('🧪 Testing local API with zipcode and categoryId...');
console.log('Test data:', JSON.stringify(testData, null, 2));

// Test the API endpoint
fetch('http://localhost:3000/api/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-key' // This might fail due to API key, but we'll see the error
  },
  body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => {
  console.log('✅ POST Response:', data);
  
  // Now test the grouped API
  return fetch('http://localhost:3000/api/leads/grouped');
})
.then(response => response.json())
.then(data => {
  console.log('✅ Grouped API Response:', data);
  
  if (data.success && data.data.length > 0) {
    console.log('🎉 Grouped leads API is working!');
    console.log('Found groups:', data.data.map(g => `${g.zipcode} - ${g.categoryName}: ${g.leadCount} leads`));
  } else {
    console.log('❌ No grouped leads found. This could be because:');
    console.log('1. Database migration not run (zipcode/categoryId columns missing)');
    console.log('2. No leads with zipcode and categoryId in database');
    console.log('3. API key authentication failed');
  }
})
.catch(error => {
  console.error('❌ Error:', error);
});
