const http = require('http');

// Test POST
const postData = JSON.stringify({ userId: 1, productId: 5 });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/recently-viewed',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
};

console.log('📤 Sending POST request...');
const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('✅ Response Status:', res.statusCode);
    console.log('✅ Response Body:', data);
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error);
});

req.write(postData);
req.end();
