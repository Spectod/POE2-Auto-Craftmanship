const https = require('https');
const fs = require('fs');
const zlib = require('zlib');

const API_BASE_URL = 'https://poe2scout.com/api';

// Headers สำหรับ request
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'en-US,en;q=0.9',
  'Connection': 'keep-alive',
  'Referer': 'https://poe2scout.com/',
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

async function fetchAllData() {
  console.log('🚀 Starting POE2 Base Items Analysis...\n');
  
  const results = {
    categories: null,
    items: {},
    weapons: {},
    armors: {},
    accessories: {},
    errors: []
  };

  try {
    // 1. Get Categories
    console.log('📂 Fetching Categories...');
    const categoriesUrl = `${API_BASE_URL}/items/categories`;
    console.log(`   URL: ${categoriesUrl}`);
    
    const categoriesData = await makeRequest(categoriesUrl);
    
    console.log('📊 Categories Response:');
    console.log(JSON.stringify(categoriesData, null, 2));
    
    if (categoriesData.error) {
      console.log('❌ Categories API Error:', categoriesData.error);
      results.errors.push(`Categories API Error: ${categoriesData.error}`);
    }
    
    if (categoriesData.data) {
      results.categories = categoriesData.data;
      console.log('✅ Categories fetched successfully');
      console.log(`   - Unique Categories: ${categoriesData.data.unique_categories?.length || 0}`);
      console.log(`   - Currency Categories: ${categoriesData.data.currency_categories?.length || 0}`);
      
      // Print all unique categories
      console.log('\n📋 Available Unique Categories:');
      categoriesData.data.unique_categories?.forEach(cat => {
        console.log(`   ${cat.icon} ${cat.label} (ID: ${cat.id}, API: ${cat.apiId})`);
      });
    } else {
      console.log('❌ No categories data found');
      results.categories = categoriesData; // Save the response for analysis
    }
    
    // 2. Get Items for weapon category specifically
    console.log('\n\n� Fetching Weapons Data...');
    
    const weaponItemsUrl = `${API_BASE_URL}/items?league=Rise of the Abyssal&category=weapon`;
    console.log(`   URL: ${weaponItemsUrl}`);
    
    const weaponData = await makeRequest(weaponItemsUrl);
    console.log('📊 Weapon Items Response:');
    console.log(JSON.stringify(weaponData, null, 2));
    
    if (weaponData.data && weaponData.data.items) {
      results.weapons['weapon'] = weaponData.data;
      console.log(`✅ Found ${weaponData.data.items.length} weapon items`);
      
      // Analyze weapon base types
      console.log('\n� Analyzing Weapon Base Types:');
      const weaponBaseTypes = new Map();
      
      weaponData.data.items.forEach(item => {
        if (item.baseType) {
          if (!weaponBaseTypes.has(item.baseType)) {
            weaponBaseTypes.set(item.baseType, []);
          }
          weaponBaseTypes.get(item.baseType).push(item.name);
        }
      });
      
      Array.from(weaponBaseTypes.entries()).forEach(([baseType, items]) => {
        console.log(`   ${baseType}: ${items.length} items`);
      });
    }
    
    // 3. Try to get items from all categories we found
    console.log('\n\n📦 Fetching All Category Items...');
    
    if (results.categories?.unique_categories) {
      for (const category of results.categories.unique_categories) {
        console.log(`\n🔍 Fetching items for: ${category.label}...`);
        
        try {
          const itemsUrl = `${API_BASE_URL}/items?league=Rise of the Abyssal&category=${category.apiId}&limit=50`;
          console.log(`   URL: ${itemsUrl}`);
          
          const itemsData = await makeRequest(itemsUrl);
          
          if (itemsData.data && itemsData.data.items) {
            results.items[category.apiId] = itemsData.data;
            console.log(`   ✅ Found ${itemsData.data.items.length} items`);
            
            // Sample some items to see their structure
            if (itemsData.data.items.length > 0) {
              console.log(`   📋 Sample item structure:`);
              const sample = itemsData.data.items[0];
              console.log(`      Name: ${sample.name}`);
              console.log(`      BaseType: ${sample.baseType}`);
              console.log(`      Category: ${sample.category}`);
              console.log(`      Item Level: ${sample.itemLevel}`);
            }
            
          } else {
            console.log(`   ❌ No items found for ${category.label}`);
            console.log(`   Response:`, JSON.stringify(itemsData, null, 2));
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.log(`   ❌ Error fetching items for ${category.label}:`, error.message);
          results.errors.push(`Error fetching ${category.label}: ${error.message}`);
        }
      }
    }
    
    // 2. Get Items for each category
    console.log('\n\n📦 Fetching Items by Category...');
    
    if (results.categories?.unique_categories) {
      for (const category of results.categories.unique_categories) {
        console.log(`\n🔍 Fetching items for: ${category.label}...`);
        
        try {
          // Try different API endpoints
          const itemsUrl1 = `${API_BASE_URL}/items?category=${category.apiId}`;
          const itemsUrl2 = `${API_BASE_URL}/items?league=Rise of the Abyssal&category=${category.apiId}`;
          
          let itemsData = await makeRequest(itemsUrl1);
          
          if (!itemsData.data || itemsData.data.items?.length === 0) {
            console.log('   Trying with league parameter...');
            itemsData = await makeRequest(itemsUrl2);
          }
          
          if (itemsData.data && itemsData.data.items) {
            results.items[category.apiId] = itemsData.data;
            console.log(`   ✅ Found ${itemsData.data.items.length} items`);
            
            // Categorize weapons
            if (category.label.toLowerCase().includes('weapon') || 
                category.label.toLowerCase().includes('sword') ||
                category.label.toLowerCase().includes('axe') ||
                category.label.toLowerCase().includes('bow') ||
                category.label.toLowerCase().includes('staff') ||
                category.label.toLowerCase().includes('mace') ||
                category.label.toLowerCase().includes('dagger') ||
                category.label.toLowerCase().includes('claw')) {
              results.weapons[category.apiId] = itemsData.data;
            }
            
            // Categorize armors
            if (category.label.toLowerCase().includes('armor') ||
                category.label.toLowerCase().includes('helmet') ||
                category.label.toLowerCase().includes('glove') ||
                category.label.toLowerCase().includes('boot') ||
                category.label.toLowerCase().includes('shield')) {
              results.armors[category.apiId] = itemsData.data;
            }
            
            // Categorize accessories
            if (category.label.toLowerCase().includes('ring') ||
                category.label.toLowerCase().includes('amulet') ||
                category.label.toLowerCase().includes('belt') ||
                category.label.toLowerCase().includes('jewel')) {
              results.accessories[category.apiId] = itemsData.data;
            }
            
          } else {
            console.log(`   ❌ No items found for ${category.label}`);
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.log(`   ❌ Error fetching items for ${category.label}:`, error.message);
        }
      }
    }
    
    // 3. Save results to file
    console.log('\n💾 Saving results to poe2_base_items_analysis.md...');
    
    let markdownContent = `# POE2 Base Items Analysis\n\n`;
    markdownContent += `Generated on: ${new Date().toISOString()}\n\n`;
    
    // Categories summary
    markdownContent += `## Categories Summary\n\n`;
    markdownContent += `Total Unique Categories: ${results.categories?.unique_categories?.length || 0}\n\n`;
    
    markdownContent += `### All Categories:\n\n`;
    results.categories?.unique_categories?.forEach(cat => {
      const itemCount = results.items[cat.apiId]?.items?.length || 0;
      markdownContent += `- **${cat.label}** (${cat.apiId}) - ${itemCount} items\n`;
    });
    
    // Weapons Analysis
    markdownContent += `\n## Weapons Analysis\n\n`;
    Object.keys(results.weapons).forEach(categoryId => {
      const category = results.categories.unique_categories.find(c => c.apiId === categoryId);
      const weaponData = results.weapons[categoryId];
      
      markdownContent += `### ${category.label}\n\n`;
      markdownContent += `Items found: ${weaponData.items.length}\n\n`;
      
      if (weaponData.items.length > 0) {
        markdownContent += `**Base Types:**\n`;
        const baseTypes = new Set();
        weaponData.items.forEach(item => {
          if (item.baseType) baseTypes.add(item.baseType);
        });
        Array.from(baseTypes).forEach(baseType => {
          markdownContent += `- ${baseType}\n`;
        });
        markdownContent += `\n`;
      }
    });
    
    // Armors Analysis
    markdownContent += `\n## Armors Analysis\n\n`;
    Object.keys(results.armors).forEach(categoryId => {
      const category = results.categories.unique_categories.find(c => c.apiId === categoryId);
      const armorData = results.armors[categoryId];
      
      markdownContent += `### ${category.label}\n\n`;
      markdownContent += `Items found: ${armorData.items.length}\n\n`;
      
      if (armorData.items.length > 0) {
        markdownContent += `**Base Types:**\n`;
        const baseTypes = new Set();
        armorData.items.forEach(item => {
          if (item.baseType) baseTypes.add(item.baseType);
        });
        Array.from(baseTypes).forEach(baseType => {
          markdownContent += `- ${baseType}\n`;
        });
        markdownContent += `\n`;
      }
    });
    
    // Accessories Analysis
    markdownContent += `\n## Accessories Analysis\n\n`;
    Object.keys(results.accessories).forEach(categoryId => {
      const category = results.categories.unique_categories.find(c => c.apiId === categoryId);
      const accessoryData = results.accessories[categoryId];
      
      markdownContent += `### ${category.label}\n\n`;
      markdownContent += `Items found: ${accessoryData.items.length}\n\n`;
      
      if (accessoryData.items.length > 0) {
        markdownContent += `**Base Types:**\n`;
        const baseTypes = new Set();
        accessoryData.items.forEach(item => {
          if (item.baseType) baseTypes.add(item.baseType);
        });
        Array.from(baseTypes).forEach(baseType => {
          markdownContent += `- ${baseType}\n`;
        });
        markdownContent += `\n`;
      }
    });
    
    // Raw Data
    markdownContent += `\n## Raw Data Summary\n\n`;
    markdownContent += `\`\`\`json\n${JSON.stringify(results, null, 2)}\`\`\`\n`;
    
    fs.writeFileSync('poe2_base_items_analysis.md', markdownContent);
    console.log('✅ Analysis saved successfully!');
    
  } catch (error) {
    console.error('❌ Error during analysis:', error);
  }
}

// Run the analysis
fetchAllData();