// Browser Console Debugging Script
// Run this in the browser console on http://localhost:3000/leads-grouped

console.log('🔍 Debugging Grouped Leads Page...');

// 1. Check if the API endpoint is working
async function testGroupedAPI() {
  try {
    console.log('📡 Testing /api/leads/grouped...');
    const response = await fetch('/api/leads/grouped');
    const data = await response.json();
    
    console.log('✅ API Response:', data);
    
    if (data.success) {
      console.log(`📊 Found ${data.count} grouped leads:`);
      data.data.forEach((group, index) => {
        console.log(`${index + 1}. ${group.zipcode} - ${group.categoryName}: ${group.leadCount} leads`);
        console.log(`   Status summary:`, group.statusSummary);
      });
    } else {
      console.error('❌ API Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Network Error:', error);
  }
}

// 2. Check if there are any leads with zipcode 93308
async function check93308Leads() {
  try {
    console.log('🔍 Checking leads for zipcode 93308...');
    const response = await fetch('/api/leads/by-group?zipcode=93308&categoryId=1');
    const data = await response.json();
    
    console.log('✅ 93308 Leads Response:', data);
    
    if (data.success) {
      console.log(`📊 Found ${data.count} leads for 93308 - Plumber:`);
      data.data.forEach((lead, index) => {
        console.log(`${index + 1}. ${lead.title} | ${lead.status} | ${lead.createdAt}`);
      });
    } else {
      console.error('❌ API Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Network Error:', error);
  }
}

// 3. Test creating a new lead (if API key is available)
async function testCreateLead() {
  const testLead = {
    "place_id": "browser_test_" + Date.now(),
    "title": "Browser Test Plumbing Co",
    "phone": "(555) 123-4567",
    "website": "https://browsertest.com",
    "zipcode": "93308",
    "category_id": "1",
    "status": "new"
  };
  
  try {
    console.log('🧪 Testing lead creation...');
    console.log('Test data:', testLead);
    
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-key' // This will likely fail, but we'll see the error
      },
      body: JSON.stringify(testLead)
    });
    
    const data = await response.json();
    console.log('📤 Create Lead Response:', data);
    
  } catch (error) {
    console.error('❌ Create Lead Error:', error);
  }
}

// Run all tests
console.log('🚀 Starting debugging tests...');
testGroupedAPI();
setTimeout(check93308Leads, 1000);
setTimeout(testCreateLead, 2000);

console.log('\n📋 Manual Steps:');
console.log('1. Check the console output above');
console.log('2. If API key error, you need to set SCRAPER_API_KEY in your environment');
console.log('3. If no leads found, the database migration might not have run');
console.log('4. If leads exist but not grouped, check the zipcode/categoryId values');

