const https = require('https');
const fs = require('fs');
const zlib = require('zlib');

// POE2DB API endpoints to test
const POE2DB_ENDPOINTS = [
  // Main POE2DB API endpoints
  'https://poe2db.tw/api/',
  'https://poe2db.tw/api/items',
  'https://poe2db.tw/api/base_items',
  'https://poe2db.tw/api/weapons',
  'https://poe2db.tw/api/armour', 
  'https://poe2db.tw/api/accessories',
  
  // JSON endpoints
  'https://poe2db.tw/json.php?type=base_items',
  'https://poe2db.tw/json.php?type=weapons',
  'https://poe2db.tw/json.php?type=items',
  'https://poe2db.tw/json/base_items.json',
  'https://poe2db.tw/json/weapons.json',
  'https://poe2db.tw/json/items.json',
  
  // Alternative patterns
  'https://poe2db.tw/data/base_items.json',
  'https://poe2db.tw/data/weapons.json',
  'https://poe2db.tw/us/json.php',
  
  // Check if there's a direct API documentation page
  'https://poe2db.tw/api.html',
  'https://poe2db.tw/docs',
  'https://poe2db.tw/api-docs'
];

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/html, application/xml, */*',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'en-US,en;q=0.9,th;q=0.8',
  'Connection': 'keep-alive',
  'Referer': 'https://poe2db.tw/',
  'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'same-origin'
};

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'GET',
      headers: headers,
      timeout: 15000,
      ...options
    }, (res) => {
      let data = [];

      let stream = res;
      if (res.headers['content-encoding'] === 'gzip') {
        stream = zlib.createGunzip();
        res.pipe(stream);
      } else if (res.headers['content-encoding'] === 'deflate') {
        stream = zlib.createInflate();
        res.pipe(stream);
      } else if (res.headers['content-encoding'] === 'br') {
        stream = zlib.createBrotliDecompress();
        res.pipe(stream);
      }

      stream.on('data', chunk => {
        data.push(chunk);
      });

      stream.on('end', () => {
        const body = Buffer.concat(data).toString();
        
        resolve({ 
          statusCode: res.statusCode,
          headers: res.headers,
          body: body.length > 2000 ? body.substring(0, 2000) + '...[truncated]' : body,
          fullBodyLength: body.length,
          isJSON: false,
          data: null
        });

        // Try to parse as JSON
        try {
          const jsonData = JSON.parse(body);
          resolve({ 
            statusCode: res.statusCode,
            headers: res.headers,
            body: body.length > 2000 ? body.substring(0, 2000) + '...[truncated]' : body,
            fullBodyLength: body.length,
            isJSON: true,
            data: jsonData
          });
        } catch (error) {
          // Not JSON, return as is
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function explorePOE2DB() {
  console.log('🔍 Exploring POE2DB API Endpoints...\n');
  
  const results = [];

  for (const url of POE2DB_ENDPOINTS) {
    console.log(`📡 Testing: ${url}`);
    
    try {
      const result = await makeRequest(url);
      
      console.log(`   Status: ${result.statusCode}`);
      console.log(`   Content-Type: ${result.headers['content-type'] || 'Unknown'}`);
      console.log(`   Content-Length: ${result.fullBodyLength} bytes`);
      console.log(`   Is JSON: ${result.isJSON ? '✅' : '❌'}`);
      
      if (result.isJSON && result.data) {
        console.log(`   JSON Keys: ${Object.keys(result.data).slice(0, 5).join(', ')}`);
        console.log(`   Data Sample: ${JSON.stringify(result.data, null, 2).substring(0, 300)}...`);
        
        // Check if this looks like POE2 base items data
        const dataStr = JSON.stringify(result.data).toLowerCase();
        const poe2Keywords = ['crossbow', 'quarterstaff', 'spirit', 'monk', 'witch', 'mercenary', 'ranger', 'sorceress', 'warrior'];
        const foundPOE2Keywords = poe2Keywords.filter(keyword => dataStr.includes(keyword));
        
        if (foundPOE2Keywords.length > 0) {
          console.log(`   🎯 POE2 Keywords Found: ${foundPOE2Keywords.join(', ')}`);
        }
      } else if (result.statusCode === 200 && !result.isJSON) {
        // Check if HTML contains useful information
        const bodyLower = result.body.toLowerCase();
        if (bodyLower.includes('api') || bodyLower.includes('json') || bodyLower.includes('weapon') || bodyLower.includes('item')) {
          console.log('   🔗 HTML contains API/item related content');
        }
      }
      
      results.push({
        url,
        statusCode: result.statusCode,
        contentType: result.headers['content-type'],
        isJSON: result.isJSON,
        bodyLength: result.fullBodyLength,
        hasData: result.isJSON && result.data,
        sample: result.isJSON ? JSON.stringify(result.data, null, 2).substring(0, 500) : result.body.substring(0, 500),
        poe2Relevant: result.isJSON && JSON.stringify(result.data).toLowerCase().includes('crossbow')
      });
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.push({
        url,
        error: error.message,
        statusCode: null,
        isJSON: false,
        hasData: false
      });
    }
    
    console.log(''); // Empty line
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('📊 Summary of API Exploration:');
  
  const workingEndpoints = results.filter(r => r.statusCode === 200 && r.hasData);
  const poe2Relevant = results.filter(r => r.poe2Relevant);
  
  console.log(`\n✅ Working JSON endpoints: ${workingEndpoints.length}`);
  console.log(`🎯 POE2-relevant endpoints: ${poe2Relevant.length}`);
  
  if (workingEndpoints.length > 0) {
    console.log('\n📋 Working Endpoints:');
    workingEndpoints.forEach(endpoint => {
      console.log(`  - ${endpoint.url}`);
      console.log(`    Content-Type: ${endpoint.contentType}`);
      console.log(`    Data size: ${endpoint.bodyLength} bytes`);
      if (endpoint.poe2Relevant) {
        console.log(`    🎯 Contains POE2 data!`);
      }
    });
  }
  
  if (poe2Relevant.length > 0) {
    console.log('\n🎯 POE2-Relevant Data Found:');
    poe2Relevant.forEach(endpoint => {
      console.log(`\n📂 ${endpoint.url}`);
      console.log(`Sample data:\n${endpoint.sample}\n`);
    });
  }
  
  // Save detailed results
  let markdownContent = `# POE2DB API Exploration Results\n\n`;
  markdownContent += `Generated on: ${new Date().toISOString()}\n\n`;
  
  markdownContent += `## Summary\n\n`;
  markdownContent += `- Total endpoints tested: ${results.length}\n`;
  markdownContent += `- Working JSON endpoints: ${workingEndpoints.length}\n`;
  markdownContent += `- POE2-relevant endpoints: ${poe2Relevant.length}\n\n`;
  
  markdownContent += `## Detailed Results\n\n`;
  
  results.forEach((result, index) => {
    markdownContent += `### ${index + 1}. ${result.url}\n\n`;
    
    if (result.error) {
      markdownContent += `**Status:** Error - ${result.error}\n\n`;
    } else {
      markdownContent += `**Status Code:** ${result.statusCode}\n`;
      markdownContent += `**Content-Type:** ${result.contentType}\n`;
      markdownContent += `**Is JSON:** ${result.isJSON ? 'Yes' : 'No'}\n`;
      markdownContent += `**Body Length:** ${result.bodyLength} bytes\n`;
      
      if (result.poe2Relevant) {
        markdownContent += `**🎯 POE2 Relevant:** Yes\n`;
      }
      
      if (result.hasData) {
        markdownContent += `\n**Sample Data:**\n\`\`\`json\n${result.sample}\n\`\`\`\n`;
      } else if (result.statusCode === 200) {
        markdownContent += `\n**Sample Content:**\n\`\`\`html\n${result.sample}\n\`\`\`\n`;
      }
    }
    
    markdownContent += `\n---\n\n`;
  });
  
  // Recommendations
  markdownContent += `## Recommendations\n\n`;
  
  if (poe2Relevant.length > 0) {
    markdownContent += `### ✅ POE2 Data Sources Found\n\n`;
    poe2Relevant.forEach(endpoint => {
      markdownContent += `- **${endpoint.url}** - Contains POE2-specific data\n`;
    });
    markdownContent += `\nProceed with implementing weapon selection using these endpoints.\n\n`;
  } else if (workingEndpoints.length > 0) {
    markdownContent += `### 📋 Available JSON Endpoints\n\n`;
    workingEndpoints.forEach(endpoint => {
      markdownContent += `- **${endpoint.url}** - Working JSON API\n`;
    });
    markdownContent += `\nCheck these endpoints manually for POE2 data structure.\n\n`;
  } else {
    markdownContent += `### ❌ No Working JSON APIs Found\n\n`;
    markdownContent += `POE2DB may not expose public JSON APIs. Consider:\n\n`;
    markdownContent += `1. **Manual POE2 data entry** - Create static data based on POE2 game information\n`;
    markdownContent += `2. **Web scraping** - Extract data from POE2DB HTML pages\n`;
    markdownContent += `3. **Community APIs** - Look for community-maintained POE2 APIs\n`;
    markdownContent += `4. **Game data files** - Extract from POE2 game installation\n\n`;
  }
  
  fs.writeFileSync('poe2db_api_exploration.md', markdownContent);
  console.log('\n💾 Results saved to poe2db_api_exploration.md');
}

explorePOE2DB();