const https = require('https');
const fs = require('fs');
const zlib = require('zlib');

// POE2DB Reverse Engineering - Check how they load data
const REVERSE_ENGINEERING_TARGETS = [
  // Main POE2DB pages to analyze
  'https://poe2db.tw/',
  'https://poe2db.tw/us/',
  
  // Weapon category pages
  'https://poe2db.tw/us/Crossbows',
  'https://poe2db.tw/us/One_Hand_Axes',
  'https://poe2db.tw/us/Two_Hand_Axes',
  'https://poe2db.tw/us/Quarterstaffs',
  'https://poe2db.tw/us/Staves',
  'https://poe2db.tw/us/Daggers',
  'https://poe2db.tw/us/Wands',
  'https://poe2db.tw/us/Sceptres',
  
  // Base items pages
  'https://poe2db.tw/us/base_items',
  'https://poe2db.tw/us/item_classes',
  'https://poe2db.tw/us/weapons',
  
  // Check for potential data loading endpoints
  'https://poe2db.tw/ajax/get_items.php',
  'https://poe2db.tw/data.php',
  'https://poe2db.tw/load_data.php'
];

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'en-US,en;q=0.9,th;q=0.8',
  'Connection': 'keep-alive',
  'Referer': 'https://poe2db.tw/',
  'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'same-origin',
  'Upgrade-Insecure-Requests': '1'
};

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'GET',
      headers: headers,
      timeout: 20000
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
          body: body
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

function analyzeHTMLForDataSources(html, url) {
  const findings = {
    url: url,
    scripts: [],
    ajaxCalls: [],
    jsonData: [],
    apiEndpoints: [],
    dataFiles: []
  };

  try {
    // Find script tags
    const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
    scriptMatches.forEach((script, index) => {
      // Look for AJAX calls
      if (script.includes('$.ajax') || script.includes('fetch(') || script.includes('XMLHttpRequest')) {
        findings.ajaxCalls.push(`Script ${index}: ${script.substring(0, 200)}...`);
      }
      
      // Look for JSON data
      if (script.includes('JSON.parse') || script.includes('"items"') || script.includes('"weapons"')) {
        findings.jsonData.push(`Script ${index}: ${script.substring(0, 300)}...`);
      }
      
      // Look for API endpoints
      const apiMatches = script.match(/['"`](https?:\/\/[^'"`\s]+\.(?:json|php|api)[^'"`\s]*)/g);
      if (apiMatches) {
        findings.apiEndpoints.push(...apiMatches.map(match => match.replace(/['"`]/g, '')));
      }
      
      // Look for data file references
      const dataMatches = script.match(/['"`]([^'"`]*\.(?:json|js|data|csv)[^'"`]*)/g);
      if (dataMatches) {
        findings.dataFiles.push(...dataMatches.map(match => match.replace(/['"`]/g, '')));
      }
    });

    // Look for external script src
    const externalScripts = html.match(/<script[^>]*src=['""]([^'""]+)['""][^>]*>/gi) || [];
    externalScripts.forEach(script => {
      const srcMatch = script.match(/src=['""]([^'""]+)['""]/) ;
      if (srcMatch) {
        findings.scripts.push(srcMatch[1]);
      }
    });

    // Look for data- attributes that might contain JSON
    const dataAttributes = html.match(/data-[^=]*=['"`](\{[^'"`]*\})[^'"`]*/g) || [];
    if (dataAttributes.length > 0) {
      findings.jsonData.push('HTML data attributes with JSON');
    }

    // Look for inline JSON
    const inlineJsonMatches = html.match(/var\s+\w+\s*=\s*(\{[^;]+\});/g) || [];
    if (inlineJsonMatches.length > 0) {
      findings.jsonData.push(...inlineJsonMatches.slice(0, 3));
    }

  } catch (error) {
    console.log(`Error analyzing ${url}: ${error.message}`);
  }

  return findings;
}

async function reverseEngineerPOE2DB() {
  console.log('🕵️ Reverse Engineering POE2DB Data Sources...\n');
  
  const allFindings = [];

  for (const url of REVERSE_ENGINEERING_TARGETS) {
    console.log(`🔍 Analyzing: ${url}`);
    
    try {
      const result = await makeRequest(url);
      
      console.log(`   Status: ${result.statusCode}`);
      
      if (result.statusCode === 200) {
        const findings = analyzeHTMLForDataSources(result.body, url);
        allFindings.push(findings);
        
        console.log(`   📜 External Scripts: ${findings.scripts.length}`);
        console.log(`   🌐 AJAX Calls Found: ${findings.ajaxCalls.length}`);
        console.log(`   📊 JSON Data: ${findings.jsonData.length}`);
        console.log(`   🔗 API Endpoints: ${findings.apiEndpoints.length}`);
        console.log(`   📁 Data Files: ${findings.dataFiles.length}`);
        
        // Show key findings
        if (findings.apiEndpoints.length > 0) {
          console.log(`   🎯 API Endpoints: ${findings.apiEndpoints.slice(0, 3).join(', ')}`);
        }
        if (findings.dataFiles.length > 0) {
          console.log(`   📁 Data Files: ${findings.dataFiles.slice(0, 3).join(', ')}`);
        }
        
      } else if (result.statusCode === 404) {
        console.log('   ❌ Page not found');
      } else {
        console.log(`   ⚠️ Unexpected status: ${result.statusCode}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Compile all discovered endpoints and data sources
  const allApiEndpoints = [...new Set(allFindings.flatMap(f => f.apiEndpoints))];
  const allDataFiles = [...new Set(allFindings.flatMap(f => f.dataFiles))];
  const allScripts = [...new Set(allFindings.flatMap(f => f.scripts))];

  console.log('📋 SUMMARY OF DISCOVERIES:');
  console.log(`\n🔗 Unique API Endpoints Found: ${allApiEndpoints.length}`);
  if (allApiEndpoints.length > 0) {
    console.log('   Endpoints:');
    allApiEndpoints.forEach(endpoint => console.log(`   - ${endpoint}`));
  }
  
  console.log(`\n📁 Unique Data Files Found: ${allDataFiles.length}`);
  if (allDataFiles.length > 0) {
    console.log('   Files:');
    allDataFiles.forEach(file => console.log(`   - ${file}`));
  }
  
  console.log(`\n📜 External Scripts: ${allScripts.length}`);
  if (allScripts.length > 0) {
    console.log('   Scripts:');
    allScripts.slice(0, 10).forEach(script => console.log(`   - ${script}`));
  }

  // Test discovered endpoints
  if (allApiEndpoints.length > 0 || allDataFiles.length > 0) {
    console.log('\n🧪 Testing Discovered Endpoints...');
    
    const testUrls = [
      ...allApiEndpoints.slice(0, 5),
      ...allDataFiles.slice(0, 5).map(file => {
        if (file.startsWith('http')) return file;
        if (file.startsWith('/')) return `https://poe2db.tw${file}`;
        return `https://poe2db.tw/${file}`;
      })
    ];

    for (const testUrl of testUrls) {
      if (testUrl) {
        console.log(`\n🧪 Testing: ${testUrl}`);
        try {
          const testResult = await makeRequest(testUrl);
          console.log(`   Status: ${testResult.statusCode}`);
          console.log(`   Content-Type: ${testResult.headers['content-type']}`);
          console.log(`   Size: ${testResult.body.length} bytes`);
          
          // Check if it's JSON
          try {
            const jsonData = JSON.parse(testResult.body);
            console.log(`   ✅ Valid JSON with keys: ${Object.keys(jsonData).slice(0, 5).join(', ')}`);
            
            // Check for POE2 weapon data
            const jsonStr = JSON.stringify(jsonData).toLowerCase();
            if (jsonStr.includes('crossbow') || jsonStr.includes('quarterstaff')) {
              console.log(`   🎯 Contains POE2 weapon data!`);
            }
          } catch (e) {
            console.log(`   📄 Content type: ${testResult.body.substring(0, 100)}...`);
          }
          
        } catch (error) {
          console.log(`   ❌ Failed: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  // Save results
  let markdownContent = `# POE2DB Reverse Engineering Results\n\n`;
  markdownContent += `Generated on: ${new Date().toISOString()}\n\n`;
  
  markdownContent += `## Summary\n\n`;
  markdownContent += `- Pages analyzed: ${allFindings.length}\n`;
  markdownContent += `- API endpoints discovered: ${allApiEndpoints.length}\n`;
  markdownContent += `- Data files discovered: ${allDataFiles.length}\n`;
  markdownContent += `- External scripts found: ${allScripts.length}\n\n`;
  
  markdownContent += `## Discovered Endpoints\n\n`;
  if (allApiEndpoints.length > 0) {
    markdownContent += `### API Endpoints\n\n`;
    allApiEndpoints.forEach(endpoint => {
      markdownContent += `- \`${endpoint}\`\n`;
    });
    markdownContent += `\n`;
  }
  
  if (allDataFiles.length > 0) {
    markdownContent += `### Data Files\n\n`;
    allDataFiles.forEach(file => {
      markdownContent += `- \`${file}\`\n`;
    });
    markdownContent += `\n`;
  }
  
  markdownContent += `## Detailed Analysis\n\n`;
  allFindings.forEach((finding, index) => {
    markdownContent += `### ${index + 1}. ${finding.url}\n\n`;
    
    if (finding.apiEndpoints.length > 0) {
      markdownContent += `**API Endpoints:**\n`;
      finding.apiEndpoints.forEach(endpoint => {
        markdownContent += `- \`${endpoint}\`\n`;
      });
      markdownContent += `\n`;
    }
    
    if (finding.jsonData.length > 0) {
      markdownContent += `**JSON Data Structures:**\n`;
      finding.jsonData.forEach(json => {
        markdownContent += `\`\`\`javascript\n${json.substring(0, 200)}...\n\`\`\`\n\n`;
      });
    }
    
    markdownContent += `---\n\n`;
  });
  
  fs.writeFileSync('poe2db_reverse_engineering.md', markdownContent);
  console.log('\n💾 Results saved to poe2db_reverse_engineering.md');
  
  // Next steps recommendations
  console.log('\n🎯 NEXT STEPS:');
  if (allApiEndpoints.length > 0 || allDataFiles.length > 0) {
    console.log('1. Test the discovered endpoints for POE2 data');
    console.log('2. Analyze the structure of any working data sources');
    console.log('3. Extract weapon and item base types');
  } else {
    console.log('1. POE2DB likely uses server-side rendering without public APIs');
    console.log('2. Consider web scraping specific weapon category pages');
    console.log('3. Look for community-maintained POE2 data sources');
    console.log('4. Create manual POE2 data structure based on game knowledge');
  }
}

reverseEngineerPOE2DB();