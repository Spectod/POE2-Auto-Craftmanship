const https = require('https');
const fs = require('fs');
const zlib = require('zlib');

// Alternative data sources for POE2
const DATA_SOURCES = [
  // POEDb API endpoints
  'https://poedb.tw/json.php?l=en&cn=BaseItemTypes',
  'https://poedb.tw/json.php?l=en&cn=ItemClasses', 
  'https://poedb.tw/api/poe2/BaseItemTypes.json',
  'https://poedb.tw/api/poe2/weapons.json',
  
  // Check if POE2 wiki has API
  'https://poe2wiki.net/api.php?action=query&format=json&list=categorymembers&cmtitle=Category:Weapons',
  
  // GitHub raw data sources (community maintained)
  'https://raw.githubusercontent.com/brather1ng/RePoE/master/RePoE/data/base_items.json',
];

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/html, */*',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'en-US,en;q=0.9',
  'Connection': 'keep-alive'
};

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'GET',
      headers: headers,
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
        
        // Handle redirects
        if (res.statusCode === 301 || res.statusCode === 302) {
          resolve({ 
            error: `Redirect ${res.statusCode}`, 
            location: res.headers.location,
            statusCode: res.statusCode 
          });
          return;
        }
        
        // Check if response is JSON
        try {
          const jsonData = JSON.parse(body);
          resolve({ 
            data: jsonData, 
            statusCode: res.statusCode,
            contentType: res.headers['content-type']
          });
        } catch (error) {
          // Return raw response if not JSON
          resolve({ 
            error: 'Not JSON', 
            body: body.length > 1000 ? body.substring(0, 1000) + '...' : body,
            statusCode: res.statusCode,
            contentType: res.headers['content-type']
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testDataSources() {
  console.log('🔍 Testing Alternative Data Sources for POE2 Base Items...\n');
  
  const results = [];

  for (const url of DATA_SOURCES) {
    console.log(`📡 Testing: ${url}`);
    
    try {
      const result = await makeRequest(url);
      
      console.log(`   Status: ${result.statusCode || 'Unknown'}`);
      console.log(`   Content-Type: ${result.contentType || 'Unknown'}`);
      
      if (result.data) {
        console.log('   ✅ JSON data received');
        console.log(`   Data type: ${typeof result.data}`);
        console.log(`   Keys: ${Object.keys(result.data).slice(0, 5).join(', ')}`);
        
        results.push({
          url,
          status: 'success',
          dataType: typeof result.data,
          keys: Object.keys(result.data).slice(0, 10),
          sampleData: JSON.stringify(result.data, null, 2).substring(0, 500) + '...'
        });
      } else if (result.error) {
        console.log(`   ❌ Error: ${result.error}`);
        if (result.location) {
          console.log(`   Redirect to: ${result.location}`);
        }
        
        results.push({
          url,
          status: 'error',
          error: result.error,
          redirect: result.location,
          body: result.body
        });
      }
      
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
      results.push({
        url,
        status: 'failed',
        error: error.message
      });
    }
    
    console.log(''); // Empty line for readability
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('💾 Saving results to data_sources_test.md...');
  
  let markdownContent = `# POE2 Data Sources Analysis\n\n`;
  markdownContent += `Generated on: ${new Date().toISOString()}\n\n`;
  
  markdownContent += `## Test Results\n\n`;
  
  results.forEach((result, index) => {
    markdownContent += `### ${index + 1}. ${result.url}\n\n`;
    markdownContent += `**Status:** ${result.status}\n\n`;
    
    if (result.status === 'success') {
      markdownContent += `**Data Type:** ${result.dataType}\n\n`;
      markdownContent += `**Available Keys:** ${result.keys.join(', ')}\n\n`;
      markdownContent += `**Sample Data:**\n\`\`\`json\n${result.sampleData}\n\`\`\`\n\n`;
    } else if (result.status === 'error') {
      markdownContent += `**Error:** ${result.error}\n\n`;
      if (result.redirect) {
        markdownContent += `**Redirect:** ${result.redirect}\n\n`;
      }
      if (result.body) {
        markdownContent += `**Response Body:**\n\`\`\`html\n${result.body}\n\`\`\`\n\n`;
      }
    } else {
      markdownContent += `**Error:** ${result.error}\n\n`;
    }
    
    markdownContent += `---\n\n`;
  });
  
  // Manual data section
  markdownContent += `## Manual POE2 Weapon Categories\n\n`;
  markdownContent += `Based on the image provided by user, here are the weapon categories:\n\n`;
  
  markdownContent += `### One Handed Weapons\n`;
  markdownContent += `- Claws\n- Daggers\n- One Handed Axes\n- One Handed Maces\n- One Handed Swords\n- Sceptres\n- Wands\n\n`;
  
  markdownContent += `### Two Handed Weapons\n`;
  markdownContent += `- Bows\n- Crossbows\n- Quarterstaffs\n- Staves\n- Two Handed Axes\n- Two Handed Maces\n- Two Handed Swords\n\n`;
  
  markdownContent += `### Armour\n`;
  markdownContent += `- Helmets\n- Body Armours\n- Gloves\n- Boots\n- Shields\n\n`;
  
  markdownContent += `### Jewellery\n`;
  markdownContent += `- Amulets\n- Rings\n- Belts\n\n`;
  
  markdownContent += `## Recommendations\n\n`;
  
  const successfulSources = results.filter(r => r.status === 'success');
  if (successfulSources.length > 0) {
    markdownContent += `### Working Data Sources Found\n\n`;
    successfulSources.forEach(source => {
      markdownContent += `- **${source.url}**\n`;
      markdownContent += `  - Data available with keys: ${source.keys.join(', ')}\n`;
    });
  } else {
    markdownContent += `### No Working Data Sources Found\n\n`;
    markdownContent += `All tested APIs are either protected by CloudFlare or don't exist for POE2.\n\n`;
    markdownContent += `**Recommended Approach:**\n`;
    markdownContent += `1. Use manual data from the user's image for weapon categories\n`;
    markdownContent += `2. Create static base items data structure in the application\n`;
    markdownContent += `3. Implement the method card visibility after weapon selection\n`;
    markdownContent += `4. Allow user to select from predefined weapon base types\n\n`;
  }
  
  fs.writeFileSync('data_sources_test.md', markdownContent);
  console.log('✅ Analysis complete and saved!');
}

testDataSources();