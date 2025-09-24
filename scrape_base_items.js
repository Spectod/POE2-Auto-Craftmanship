const https = require('https');
const fs = require('fs');
const zlib = require('zlib');

// POE2DB weapon pages for HTML table scraping
const WEAPON_PAGES = [
  { url: 'https://poe2db.tw/us/Crossbows', category: 'crossbows', type: 'twoHanded' },
  { url: 'https://poe2db.tw/us/One_Hand_Axes', category: 'oneHandAxes', type: 'oneHanded' },
  { url: 'https://poe2db.tw/us/Two_Hand_Axes', category: 'twoHandAxes', type: 'twoHanded' },
  { url: 'https://poe2db.tw/us/One_Hand_Maces', category: 'oneHandMaces', type: 'oneHanded' },
  { url: 'https://poe2db.tw/us/Two_Hand_Maces', category: 'twoHandMaces', type: 'twoHanded' },
  { url: 'https://poe2db.tw/us/One_Hand_Swords', category: 'oneHandSwords', type: 'oneHanded' },
  { url: 'https://poe2db.tw/us/Two_Hand_Swords', category: 'twoHandSwords', type: 'twoHanded' },
  { url: 'https://poe2db.tw/us/Bows', category: 'bows', type: 'twoHanded' },
  { url: 'https://poe2db.tw/us/Quarterstaffs', category: 'quarterstaffs', type: 'twoHanded' },
  { url: 'https://poe2db.tw/us/Staves', category: 'staves', type: 'twoHanded' },
  { url: 'https://poe2db.tw/us/Daggers', category: 'daggers', type: 'oneHanded' },
  { url: 'https://poe2db.tw/us/Claws', category: 'claws', type: 'oneHanded' },
  { url: 'https://poe2db.tw/us/Wands', category: 'wands', type: 'oneHanded' },
  { url: 'https://poe2db.tw/us/Sceptres', category: 'sceptres', type: 'oneHanded' }
];

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'en-US,en;q=0.9',
  'Connection': 'keep-alive',
  'Referer': 'https://poe2db.tw/'
};

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'GET',
      headers: headers,
      timeout: 15000
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
          body: body
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

function extractBaseItemsFromHTML(html) {
  const items = [];
  
  try {
    // Look for tables containing base items
    const tableMatches = html.match(/<table[^>]*>([\s\S]*?)<\/table>/gi) || [];
    
    tableMatches.forEach(table => {
      // Look for rows with item data
      const rowMatches = table.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
      
      rowMatches.forEach(row => {
        // Skip header rows
        if (row.includes('<th')) return;
        
        // Extract cell data
        const cellMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
        
        if (cellMatches.length >= 2) {
          const cells = cellMatches.map(cell => {
            // Remove HTML tags and clean up text
            return cell.replace(/<[^>]+>/g, '').trim();
          });
          
          // First cell usually contains the item name
          const itemName = cells[0];
          
          // Skip empty names or obvious non-items
          if (itemName && 
              itemName.length > 1 && 
              !itemName.includes('Level') &&
              !itemName.includes('Physical') &&
              !itemName.includes('Critical') &&
              !itemName.includes('Attack') &&
              !itemName.includes('Range') &&
              !itemName.includes('Requirements') &&
              !itemName.match(/^\d+$/) && // Skip pure numbers
              !itemName.includes('%') &&
              !itemName.includes('–')) {
            
            // Try to extract level requirement
            let level = 1;
            const levelMatch = cells.find(cell => cell && cell.match(/^\d{1,2}$/));
            if (levelMatch) {
              level = parseInt(levelMatch);
            }
            
            items.push({
              name: itemName,
              level: level,
              rawData: cells
            });
          }
        }
      });
    });

    // Also look for links to item pages (alternative method)
    const linkMatches = html.match(/<a[^>]*href="[^"]*\/item\/[^"]*"[^>]*>(.*?)<\/a>/gi) || [];
    
    linkMatches.forEach(link => {
      const nameMatch = link.match(/>([^<]+)</);
      if (nameMatch) {
        const itemName = nameMatch[1].trim();
        
        // Check if this is likely a base item name
        if (itemName && 
            itemName.length > 1 && 
            !items.find(item => item.name === itemName) &&
            !itemName.includes('(') &&
            !itemName.includes('%')) {
          
          items.push({
            name: itemName,
            level: 1,
            source: 'link'
          });
        }
      }
    });

  } catch (error) {
    console.log(`Error parsing HTML: ${error.message}`);
  }
  
  // Remove duplicates and sort by name
  const uniqueItems = items.filter((item, index, self) => 
    index === self.findIndex(i => i.name === item.name)
  ).sort((a, b) => a.name.localeCompare(b.name));
  
  return uniqueItems;
}

async function scrapeBaseItems() {
  console.log('🌐 Scraping POE2 Base Items from HTML Tables...\n');
  
  const allWeapons = {
    oneHandedWeapons: {},
    twoHandedWeapons: {}
  };
  
  const scrapingResults = [];

  for (const weaponPage of WEAPON_PAGES) {
    console.log(`🔍 Scraping: ${weaponPage.url}`);
    console.log(`   Category: ${weaponPage.category} (${weaponPage.type})`);
    
    try {
      const result = await makeRequest(weaponPage.url);
      
      if (result.statusCode === 200) {
        const baseItems = extractBaseItemsFromHTML(result.body);
        
        console.log(`   ✅ Found ${baseItems.length} base items`);
        
        if (baseItems.length > 0) {
          // Show sample items
          const sampleItems = baseItems.slice(0, 5).map(item => item.name);
          console.log(`   📋 Sample: ${sampleItems.join(', ')}`);
          
          // Store in appropriate category
          if (weaponPage.type === 'oneHanded') {
            allWeapons.oneHandedWeapons[weaponPage.category] = baseItems;
          } else {
            allWeapons.twoHandedWeapons[weaponPage.category] = baseItems;
          }
          
          scrapingResults.push({
            url: weaponPage.url,
            category: weaponPage.category,
            type: weaponPage.type,
            itemCount: baseItems.length,
            items: baseItems
          });
        } else {
          console.log(`   ⚠️ No items found - might need to adjust parsing logic`);
          
          // Show a sample of the HTML for debugging
          const htmlSample = result.body.substring(result.body.indexOf('<table'), result.body.indexOf('<table') + 1000);
          if (htmlSample.length > 10) {
            console.log(`   🔍 HTML Sample: ${htmlSample.substring(0, 200)}...`);
          }
        }
        
      } else if (result.statusCode === 404) {
        console.log(`   ❌ Page not found`);
      } else {
        console.log(`   ⚠️ Unexpected status: ${result.statusCode}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      scrapingResults.push({
        url: weaponPage.url,
        category: weaponPage.category,
        error: error.message
      });
    }
    
    console.log('');
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('📊 SCRAPING SUMMARY:');
  
  const totalOneHanded = Object.values(allWeapons.oneHandedWeapons).reduce((sum, items) => sum + items.length, 0);
  const totalTwoHanded = Object.values(allWeapons.twoHandedWeapons).reduce((sum, items) => sum + items.length, 0);
  
  console.log(`\n⚔️ One Handed Weapons: ${totalOneHanded} items`);
  Object.entries(allWeapons.oneHandedWeapons).forEach(([category, items]) => {
    console.log(`   ${category}: ${items.length} items`);
  });
  
  console.log(`\n🗡️ Two Handed Weapons: ${totalTwoHanded} items`);
  Object.entries(allWeapons.twoHandedWeapons).forEach(([category, items]) => {
    console.log(`   ${category}: ${items.length} items`);
  });
  
  console.log(`\n📊 Total: ${totalOneHanded + totalTwoHanded} base items`);

  // Save detailed results
  const detailedData = {
    metadata: {
      scrapedOn: new Date().toISOString(),
      totalCategories: Object.keys(allWeapons.oneHandedWeapons).length + Object.keys(allWeapons.twoHandedWeapons).length,
      totalItems: totalOneHanded + totalTwoHanded,
      sources: scrapingResults.filter(r => !r.error).map(r => r.url)
    },
    weapons: allWeapons,
    scrapingDetails: scrapingResults
  };
  
  fs.writeFileSync('poe2_scraped_base_items.json', JSON.stringify(detailedData, null, 2));
  
  // Create simplified structure for the Vue app
  const appData = {
    weapons: {
      oneHandedWeapons: {},
      twoHandedWeapons: {}
    }
  };
  
  // Convert to simple name arrays for the app
  Object.entries(allWeapons.oneHandedWeapons).forEach(([category, items]) => {
    appData.weapons.oneHandedWeapons[category] = items.map(item => item.name);
  });
  
  Object.entries(allWeapons.twoHandedWeapons).forEach(([category, items]) => {
    appData.weapons.twoHandedWeapons[category] = items.map(item => item.name);
  });
  
  fs.writeFileSync('poe2_app_ready_data.json', JSON.stringify(appData, null, 2));
  
  console.log(`\n💾 Files saved:`);
  console.log(`   ✅ poe2_scraped_base_items.json - Detailed scraping results`);
  console.log(`   ✅ poe2_app_ready_data.json - Ready for Vue component`);
  
  // Show next steps
  console.log(`\n🎯 NEXT STEPS:`);
  if (totalOneHanded + totalTwoHanded > 0) {
    console.log(`1. ✅ Real POE2 data extracted successfully!`);
    console.log(`2. Import poe2_app_ready_data.json into ProfitOptimizer.vue`);
    console.log(`3. Add weapon category selection UI`);
    console.log(`4. Implement method cards visibility after weapon selection`);
  } else {
    console.log(`1. ❌ No base items found - HTML structure may have changed`);
    console.log(`2. Review HTML samples above to adjust parsing logic`);
    console.log(`3. Consider alternative extraction methods`);
  }
}

scrapeBaseItems();