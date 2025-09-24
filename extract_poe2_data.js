const https = require('https');
const fs = require('fs');
const zlib = require('zlib');

// POE2DB internal scripts and data extraction
const INTERNAL_SCRIPTS = [
  'https://cdn.poe2db.tw/js/poedb_header.28012a404715e124.js',
  'https://cdn.poe2db.tw/js/poedb_footer.50c57170608058e8.js',
  'https://poe2db.tw/js/reformat_mod2.js?20240402_20'
];

// Pages with JSON data embedded
const PAGES_WITH_JSON = [
  'https://poe2db.tw/us/Crossbows',
  'https://poe2db.tw/us/One_Hand_Axes', 
  'https://poe2db.tw/us/Two_Hand_Axes',
  'https://poe2db.tw/us/Staves',
  'https://poe2db.tw/us/Daggers',
  'https://poe2db.tw/us/Wands',
  'https://poe2db.tw/us/Sceptres'
];

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/javascript, text/html, */*',
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

function extractJSONFromHTML(html, url) {
  const findings = [];
  
  try {
    // Look for JavaScript variables with JSON data
    const jsVarPatterns = [
      /var\s+(\w+)\s*=\s*(\[[\s\S]*?\]);/g,
      /var\s+(\w+)\s*=\s*(\{[\s\S]*?\});/g,
      /let\s+(\w+)\s*=\s*(\[[\s\S]*?\]);/g,
      /let\s+(\w+)\s*=\s*(\{[\s\S]*?\});/g,
      /const\s+(\w+)\s*=\s*(\[[\s\S]*?\]);/g,
      /const\s+(\w+)\s*=\s*(\{[\s\S]*?\});/g
    ];
    
    jsVarPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const varName = match[1];
        const jsonString = match[2];
        
        try {
          const jsonData = JSON.parse(jsonString);
          findings.push({
            variable: varName,
            type: Array.isArray(jsonData) ? 'array' : 'object',
            size: Array.isArray(jsonData) ? jsonData.length : Object.keys(jsonData).length,
            data: jsonData,
            sample: JSON.stringify(jsonData, null, 2).substring(0, 500) + '...'
          });
        } catch (e) {
          // Not valid JSON, skip
        }
      }
    });

    // Look for inline JSON in script tags
    const scriptTags = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
    
    scriptTags.forEach((script, index) => {
      // Remove script tags
      const scriptContent = script.replace(/<\/?script[^>]*>/gi, '');
      
      // Look for JSON objects/arrays
      const jsonMatches = [
        ...scriptContent.matchAll(/(\{[^{}]*"[^"]*"[^{}]*:[^{}]*\})/g),
        ...scriptContent.matchAll(/(\[[^\[\]]*\{[^{}]*\}[^\[\]]*\])/g)
      ];
      
      jsonMatches.forEach(match => {
        try {
          const jsonData = JSON.parse(match[1]);
          findings.push({
            source: `script_${index}`,
            type: Array.isArray(jsonData) ? 'array' : 'object', 
            size: Array.isArray(jsonData) ? jsonData.length : Object.keys(jsonData).length,
            data: jsonData,
            sample: JSON.stringify(jsonData, null, 2).substring(0, 300) + '...'
          });
        } catch (e) {
          // Not valid JSON
        }
      });
    });

  } catch (error) {
    console.log(`Error extracting JSON from ${url}: ${error.message}`);
  }
  
  return findings;
}

function analyzeForPOE2Data(jsonData) {
  const analysis = {
    isPOE2Relevant: false,
    weaponData: false,
    baseItems: false,
    keywords: []
  };

  try {
    const jsonString = JSON.stringify(jsonData).toLowerCase();
    
    // POE2-specific keywords
    const poe2Keywords = [
      'crossbow', 'quarterstaff', 'spirit', 'monk', 'witch', 'mercenary', 
      'ranger', 'sorceress', 'warrior', 'infernalist', 'gemling'
    ];
    
    const weaponKeywords = [
      'weapon', 'axe', 'sword', 'mace', 'bow', 'staff', 'wand', 'sceptre', 
      'dagger', 'claw', 'base_item', 'item_class'
    ];
    
    // Check for POE2 keywords
    poe2Keywords.forEach(keyword => {
      if (jsonString.includes(keyword)) {
        analysis.isPOE2Relevant = true;
        analysis.keywords.push(keyword);
      }
    });
    
    // Check for weapon data
    weaponKeywords.forEach(keyword => {
      if (jsonString.includes(keyword)) {
        analysis.weaponData = true;
        analysis.keywords.push(keyword);
      }
    });
    
    // Check structure for base items
    if (Array.isArray(jsonData)) {
      jsonData.forEach(item => {
        if (typeof item === 'object' && (item.name || item.text || item.base_name)) {
          analysis.baseItems = true;
        }
      });
    } else if (typeof jsonData === 'object') {
      Object.keys(jsonData).forEach(key => {
        if (key.includes('item') || key.includes('weapon') || key.includes('base')) {
          analysis.baseItems = true;
        }
      });
    }
    
  } catch (error) {
    console.log('Error analyzing POE2 data:', error.message);
  }
  
  return analysis;
}

async function extractPOE2Data() {
  console.log('🔬 Extracting POE2 Data from Internal Scripts and Pages...\n');
  
  const allFindings = [];

  // First, analyze internal scripts
  console.log('📜 Analyzing Internal Scripts...');
  for (const scriptUrl of INTERNAL_SCRIPTS) {
    console.log(`\n🔍 ${scriptUrl}`);
    
    try {
      const result = await makeRequest(scriptUrl);
      
      if (result.statusCode === 200) {
        console.log(`   ✅ Script loaded (${result.body.length} bytes)`);
        
        // Look for endpoints or data URLs in the script
        const urlMatches = result.body.match(/https?:\/\/[^\s"']+/g) || [];
        const dataEndpoints = urlMatches.filter(url => 
          url.includes('.json') || url.includes('/api/') || url.includes('/data/')
        );
        
        if (dataEndpoints.length > 0) {
          console.log(`   🔗 Data endpoints found: ${dataEndpoints.length}`);
          dataEndpoints.forEach(endpoint => console.log(`      - ${endpoint}`));
        }
        
        // Look for function calls that might load data
        const ajaxCalls = result.body.match(/\$\.ajax\([^)]+\)|fetch\([^)]+\)|XMLHttpRequest/g) || [];
        if (ajaxCalls.length > 0) {
          console.log(`   📡 AJAX calls found: ${ajaxCalls.length}`);
        }
        
      } else {
        console.log(`   ❌ Failed to load script (${result.statusCode})`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Now analyze pages with embedded JSON
  console.log('\n\n📄 Extracting JSON Data from Weapon Pages...');
  
  for (const pageUrl of PAGES_WITH_JSON) {
    console.log(`\n🔍 ${pageUrl}`);
    
    try {
      const result = await makeRequest(pageUrl);
      
      if (result.statusCode === 200) {
        const jsonFindings = extractJSONFromHTML(result.body, pageUrl);
        
        console.log(`   📊 JSON objects found: ${jsonFindings.length}`);
        
        if (jsonFindings.length > 0) {
          jsonFindings.forEach((finding, index) => {
            console.log(`\n   📋 JSON ${index + 1}:`);
            console.log(`      Variable: ${finding.variable || finding.source}`);
            console.log(`      Type: ${finding.type}`);
            console.log(`      Size: ${finding.size} items`);
            
            const analysis = analyzeForPOE2Data(finding.data);
            
            if (analysis.isPOE2Relevant || analysis.weaponData) {
              console.log(`      🎯 POE2 Relevant: ${analysis.isPOE2Relevant ? 'YES' : 'NO'}`);
              console.log(`      ⚔️ Weapon Data: ${analysis.weaponData ? 'YES' : 'NO'}`);
              console.log(`      📦 Base Items: ${analysis.baseItems ? 'YES' : 'NO'}`);
              if (analysis.keywords.length > 0) {
                console.log(`      🔑 Keywords: ${analysis.keywords.join(', ')}`);
              }
              
              // Save relevant data
              allFindings.push({
                url: pageUrl,
                variable: finding.variable || finding.source,
                data: finding.data,
                analysis: analysis
              });
              
              console.log(`      📄 Sample:`);
              console.log(`         ${finding.sample.substring(0, 200)}...`);
            }
          });
        }
        
      } else {
        console.log(`   ❌ Failed to load page (${result.statusCode})`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Compile and save results
  console.log('\n\n📋 COMPILATION OF EXTRACTED POE2 DATA:');
  
  if (allFindings.length > 0) {
    console.log(`\n✅ Found ${allFindings.length} relevant data sources`);
    
    // Combine all weapon data
    const combinedWeapons = {};
    
    allFindings.forEach(finding => {
      const weaponType = finding.url.split('/').pop(); // Get weapon type from URL
      
      if (Array.isArray(finding.data)) {
        combinedWeapons[weaponType] = finding.data.map(item => ({
          name: item.name || item.text || item.base_name || 'Unknown',
          level: item.level || item.drop_level || 1,
          class: item.item_class || item.class || weaponType,
          id: item.id || item.key || item.name,
          ...item
        }));
      }
      
      console.log(`\n📂 ${weaponType.toUpperCase()}:`);
      console.log(`   Items: ${combinedWeapons[weaponType]?.length || 0}`);
      if (combinedWeapons[weaponType]?.length > 0) {
        const sampleItems = combinedWeapons[weaponType].slice(0, 5).map(item => item.name);
        console.log(`   Sample: ${sampleItems.join(', ')}`);
      }
    });
    
    // Save compiled data
    const poe2Data = {
      metadata: {
        extractedOn: new Date().toISOString(),
        sources: allFindings.map(f => f.url),
        totalWeaponTypes: Object.keys(combinedWeapons).length,
        totalItems: Object.values(combinedWeapons).reduce((sum, items) => sum + (items?.length || 0), 0)
      },
      weapons: combinedWeapons
    };
    
    fs.writeFileSync('poe2_extracted_data.json', JSON.stringify(poe2Data, null, 2));
    console.log(`\n💾 Data saved to poe2_extracted_data.json`);
    
    // Create simplified structure for the app
    const simplifiedData = {
      weapons: {
        oneHandedWeapons: {},
        twoHandedWeapons: {}
      },
      armour: {},
      jewellery: {}
    };
    
    // Categorize weapons
    Object.entries(combinedWeapons).forEach(([type, items]) => {
      const lowerType = type.toLowerCase();
      
      if (lowerType.includes('one_hand') || ['daggers', 'wands', 'sceptres'].includes(lowerType)) {
        simplifiedData.weapons.oneHandedWeapons[lowerType] = items.map(item => item.name);
      } else if (lowerType.includes('two_hand') || ['staves', 'crossbows'].includes(lowerType)) {
        simplifiedData.weapons.twoHandedWeapons[lowerType] = items.map(item => item.name);
      }
    });
    
    fs.writeFileSync('poe2_app_data.json', JSON.stringify(simplifiedData, null, 2));
    console.log(`💾 App-ready data saved to poe2_app_data.json`);
    
  } else {
    console.log('\n❌ No relevant POE2 data found in the analyzed pages');
  }
}

extractPOE2Data();