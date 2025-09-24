const https = require('https');
const fs = require('fs');
const zlib = require('zlib');

// POE2 Official Trade API endpoints 
const API_ENDPOINTS = {
  stats: 'https://www.pathofexile2.com/api/trade/data/stats',
  items: 'https://www.pathofexile2.com/api/trade/data/items',
  leagues: 'https://www.pathofexile2.com/api/trade/data/leagues'
};

// Headers สำหรับ request
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'en-US,en;q=0.9',
  'Connection': 'keep-alive',
  'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin'
};

// Function to make API request
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'GET',
      headers: headers,
      ...options
    }, (res) => {
      let data = [];

      // Handle different encodings
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
        try {
          const body = Buffer.concat(data).toString();
          const jsonData = JSON.parse(body);
          resolve(jsonData);
        } catch (error) {
          resolve({ error: 'Failed to parse JSON', body: Buffer.concat(data).toString() });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function analyzeOfficialAPI() {
  console.log('🚀 Analyzing POE2 Official Trade API...\n');
  
  const results = {
    leagues: null,
    stats: null,
    items: null,
    weapons: {},
    armors: {},
    accessories: {},
    errors: []
  };

  try {
    // 1. Get Leagues
    console.log('📂 Fetching Leagues...');
    console.log(`   URL: ${API_ENDPOINTS.leagues}`);
    
    const leaguesData = await makeRequest(API_ENDPOINTS.leagues);
    console.log('📊 Leagues Response:');
    console.log(JSON.stringify(leaguesData, null, 2));
    
    if (leaguesData.result) {
      results.leagues = leaguesData.result;
      console.log(`✅ Found ${leaguesData.result.length} leagues`);
    } else {
      console.log('❌ No leagues data found');
      results.errors.push('No leagues data found');
    }

    // 2. Get Items
    console.log('\n📦 Fetching Items...');
    console.log(`   URL: ${API_ENDPOINTS.items}`);
    
    const itemsData = await makeRequest(API_ENDPOINTS.items);
    console.log('📊 Items Response Structure:');
    
    if (itemsData.result) {
      results.items = itemsData.result;
      console.log(`✅ Items data loaded successfully`);
      
      // Analyze structure
      console.log('\n🔍 Analyzing Items Structure:');
      Object.keys(itemsData.result).forEach(category => {
        const categoryData = itemsData.result[category];
        console.log(`\n📂 Category: ${category}`);
        console.log(`   Type: ${typeof categoryData}`);
        
        if (Array.isArray(categoryData)) {
          console.log(`   Items count: ${categoryData.length}`);
          if (categoryData.length > 0) {
            console.log(`   Sample item:`, JSON.stringify(categoryData[0], null, 2));
          }
        } else if (typeof categoryData === 'object') {
          console.log(`   Subcategories: ${Object.keys(categoryData).join(', ')}`);
          
          // Look deeper into subcategories
          Object.keys(categoryData).forEach(subcat => {
            const subcatData = categoryData[subcat];
            if (Array.isArray(subcatData)) {
              console.log(`     ${subcat}: ${subcatData.length} items`);
              
              // Sample items from weapons
              if ((category.toLowerCase().includes('weapon') || subcat.toLowerCase().includes('weapon')) 
                  && subcatData.length > 0) {
                console.log(`       Sample weapon:`, JSON.stringify(subcatData[0], null, 2));
                results.weapons[`${category}.${subcat}`] = subcatData;
              }
              
              // Sample items from armour
              if ((category.toLowerCase().includes('armour') || subcat.toLowerCase().includes('armour') || 
                   subcat.toLowerCase().includes('helmet') || subcat.toLowerCase().includes('chest') ||
                   subcat.toLowerCase().includes('gloves') || subcat.toLowerCase().includes('boots')) 
                  && subcatData.length > 0) {
                console.log(`       Sample armour:`, JSON.stringify(subcatData[0], null, 2));
                results.armors[`${category}.${subcat}`] = subcatData;
              }
              
              // Sample accessories
              if ((category.toLowerCase().includes('accessory') || subcat.toLowerCase().includes('ring') || 
                   subcat.toLowerCase().includes('amulet') || subcat.toLowerCase().includes('belt')) 
                  && subcatData.length > 0) {
                console.log(`       Sample accessory:`, JSON.stringify(subcatData[0], null, 2));
                results.accessories[`${category}.${subcat}`] = subcatData;
              }
            }
          });
        }
      });
    } else {
      console.log('❌ No items data found');
      results.errors.push('No items data found');
    }

    // 3. Get Stats
    console.log('\n📊 Fetching Stats...');
    console.log(`   URL: ${API_ENDPOINTS.stats}`);
    
    const statsData = await makeRequest(API_ENDPOINTS.stats);
    
    if (statsData.result) {
      results.stats = statsData.result;
      console.log(`✅ Stats data loaded successfully`);
      console.log(`   Stats categories: ${Object.keys(statsData.result).join(', ')}`);
    } else {
      console.log('❌ No stats data found');
      results.errors.push('No stats data found');
    }

    // 4. Save results to markdown
    console.log('\n💾 Saving results to poe2_official_trade_analysis.md...');
    
    let markdownContent = `# POE2 Official Trade API Analysis\n\n`;
    markdownContent += `Generated on: ${new Date().toISOString()}\n\n`;
    
    // Leagues
    if (results.leagues) {
      markdownContent += `## Leagues\n\n`;
      results.leagues.forEach(league => {
        markdownContent += `- **${league.id}**: ${league.text}\n`;
      });
      markdownContent += `\n`;
    }
    
    // Items Summary
    if (results.items) {
      markdownContent += `## Items Categories\n\n`;
      Object.keys(results.items).forEach(category => {
        markdownContent += `### ${category}\n\n`;
        const categoryData = results.items[category];
        
        if (typeof categoryData === 'object' && !Array.isArray(categoryData)) {
          Object.keys(categoryData).forEach(subcat => {
            const subcatData = categoryData[subcat];
            if (Array.isArray(subcatData)) {
              markdownContent += `- **${subcat}**: ${subcatData.length} items\n`;
              
              // Show base types for weapons and armours
              if (subcatData.length > 0 && (category.toLowerCase().includes('weapon') || 
                  category.toLowerCase().includes('armour'))) {
                const baseTypes = new Set();
                subcatData.forEach(item => {
                  if (item.text) baseTypes.add(item.text);
                });
                if (baseTypes.size > 0) {
                  markdownContent += `  - Base types: ${Array.from(baseTypes).slice(0, 10).join(', ')}\n`;
                  if (baseTypes.size > 10) {
                    markdownContent += `  - ... and ${baseTypes.size - 10} more\n`;
                  }
                }
              }
            }
          });
        }
        markdownContent += `\n`;
      });
    }
    
    // Weapons Analysis
    if (Object.keys(results.weapons).length > 0) {
      markdownContent += `## Weapons Analysis\n\n`;
      Object.keys(results.weapons).forEach(weaponCategory => {
        const weapons = results.weapons[weaponCategory];
        markdownContent += `### ${weaponCategory}\n\n`;
        markdownContent += `Total weapons: ${weapons.length}\n\n`;
        
        markdownContent += `**Weapon Base Types:**\n`;
        weapons.forEach(weapon => {
          markdownContent += `- ${weapon.text} (${weapon.type || 'Unknown'})\n`;
        });
        markdownContent += `\n`;
      });
    }
    
    // Raw Data Summary (truncated)
    markdownContent += `\n## Raw Data Structure\n\n`;
    markdownContent += `\`\`\`json\n`;
    markdownContent += JSON.stringify({
      leagues: results.leagues ? results.leagues.length : 0,
      items_categories: results.items ? Object.keys(results.items) : [],
      stats_categories: results.stats ? Object.keys(results.stats) : [],
      weapons_found: Object.keys(results.weapons),
      armors_found: Object.keys(results.armors),
      accessories_found: Object.keys(results.accessories),
      errors: results.errors
    }, null, 2);
    markdownContent += `\n\`\`\`\n`;
    
    fs.writeFileSync('poe2_official_trade_analysis.md', markdownContent);
    console.log('✅ Analysis saved successfully!');
    
  } catch (error) {
    console.error('❌ Error during analysis:', error);
    results.errors.push(error.message);
  }
}

// Run the analysis
analyzeOfficialAPI();