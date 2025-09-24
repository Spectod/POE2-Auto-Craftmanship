// POE2 Trade API Reverse Engineering Tool
// ใช้สำหรับหา endpoints ที่ POE2 trade website ใช้

const https = require('https');
const fs = require('fs');

class POE2TradeAnalyzer {
  constructor() {
    this.baseUrl = 'www.pathofexile.com';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    this.headers = {
      'User-Agent': this.userAgent,
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };
  }

  // Test basic trade website access
  async testTradeWebsite() {
    console.log('🔍 Testing POE2 trade website access...\n');
    
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        path: '/trade2',
        method: 'GET',
        headers: this.headers
      };

      const req = https.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);
        
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          console.log(`\n📄 Response length: ${data.length} chars`);
          
          // Look for API endpoints in the response
          const apiMatches = data.match(/\/api\/[^"'\s]+/g);
          if (apiMatches) {
            console.log('\n🎯 Found potential API endpoints:');
            [...new Set(apiMatches)].forEach(match => {
              console.log(`  - ${match}`);
            });
          }

          resolve({ statusCode: res.statusCode, data, headers: res.headers });
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => reject(new Error('Request timeout')));
      req.end();
    });
  }

  // Try common API endpoints patterns
  async testAPIEndpoints() {
    console.log('\n🧪 Testing common API endpoint patterns...\n');
    
    const endpoints = [
      '/api/trade2/search',
      '/api/trade2/data/leagues',
      '/api/trade2/data/items',
      '/api/trade2/data/stats',
      '/api/trade2/exchange',
      '/api/trade/data/leagues', // might be same as POE1
      '/api/leagues?realm=poe2'
    ];

    for (const endpoint of endpoints) {
      try {
        const result = await this.testEndpoint(endpoint);
        if (result.statusCode === 200) {
          console.log(`✅ ${endpoint} - Working! (${result.data.length} chars)`);
          
          // Try to parse as JSON
          try {
            const json = JSON.parse(result.data);
            console.log(`   📊 JSON Keys:`, Object.keys(json));
          } catch (e) {
            console.log(`   📄 Non-JSON response`);
          }
        } else if (result.statusCode === 401) {
          console.log(`🔐 ${endpoint} - Requires authentication`);
        } else {
          console.log(`❌ ${endpoint} - Status ${result.statusCode}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} - Error: ${error.message}`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Test a specific endpoint
  async testEndpoint(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        path: path,
        method: method,
        headers: {
          ...this.headers,
          ...(body && { 'Content-Type': 'application/json' })
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data, headers: res.headers }));
      });

      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('Timeout')));
      
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  // Try to mimic what POE2 overlay might do
  async testTradeSearch() {
    console.log('\n🔎 Testing trade search patterns...\n');
    
    // Common search patterns that overlays might use
    const searchBodies = [
      {
        query: {
          status: { option: 'online' },
          filters: {
            type_filters: {
              filters: {
                category: { option: 'weapon.sword' }
              }
            }
          }
        }
      },
      {
        query: {
          status: { option: 'online' },
          type: 'Divine Orb'
        }
      }
    ];

    const searchEndpoints = [
      '/api/trade2/search/Settlers%20of%20Kalguur',
      '/api/trade/search/Settlers%20of%20Kalguur', // might be same format
      '/api/trade2/search/Standard'
    ];

    for (const endpoint of searchEndpoints) {
      for (const body of searchBodies) {
        try {
          console.log(`Testing: POST ${endpoint}`);
          const result = await this.testEndpoint(endpoint, 'POST', body);
          
          if (result.statusCode === 200) {
            console.log(`✅ Success! Response:`);
            try {
              const json = JSON.parse(result.data);
              console.log(JSON.stringify(json, null, 2));
            } catch (e) {
              console.log(result.data.substring(0, 200) + '...');
            }
            break; // Success, move to next endpoint
          } else {
            console.log(`   Status: ${result.statusCode}`);
          }
        } catch (error) {
          console.log(`   Error: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
  }

  // Analyze JavaScript files for API calls
  async analyzeJavaScriptFiles(htmlContent) {
    console.log('\n📜 Analyzing JavaScript files for API calls...\n');
    
    // Extract script src URLs
    const scriptMatches = htmlContent.match(/<script[^>]+src=["']([^"']+)["']/g);
    if (!scriptMatches) {
      console.log('No script tags found');
      return;
    }

    const scriptUrls = scriptMatches.map(match => {
      const srcMatch = match.match(/src=["']([^"']+)["']/);
      return srcMatch ? srcMatch[1] : null;
    }).filter(Boolean);

    console.log('Found script files:');
    scriptUrls.forEach(url => console.log(`  - ${url}`));

    // Try to fetch and analyze a few key scripts
    for (const url of scriptUrls.slice(0, 3)) {
      try {
        const fullUrl = url.startsWith('http') ? url : `https://www.pathofexile.com${url}`;
        console.log(`\n🔍 Analyzing: ${fullUrl}`);
        
        const result = await this.fetchUrl(fullUrl);
        if (result.data) {
          // Look for API endpoint patterns in JavaScript
          const apiPatterns = [
            /\/api\/[^"'\s\)]+/g,
            /["']https?:\/\/[^"']+\.pathofexile\.com\/api\/[^"']+["']/g,
            /fetch\s*\(\s*["'][^"']+["']/g,
            /axios\.[^(]+\(\s*["'][^"']+["']/g
          ];

          apiPatterns.forEach((pattern, index) => {
            const matches = result.data.match(pattern);
            if (matches) {
              console.log(`  Pattern ${index + 1} matches:`, [...new Set(matches)].slice(0, 5));
            }
          });
        }
      } catch (error) {
        console.log(`  Error analyzing ${url}: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async fetchUrl(url) {
    return new Promise((resolve, reject) => {
      https.get(url, {
        headers: this.headers
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      }).on('error', reject).setTimeout(10000, () => reject(new Error('Timeout')));
    });
  }

  // Main analysis function
  async analyze() {
    console.log('🚀 Starting POE2 Trade API Analysis\n');
    console.log('=' .repeat(50));

    try {
      // Step 1: Test basic website access
      const tradeResult = await this.testTradeWebsite();
      
      // Step 2: Analyze HTML for API endpoints
      if (tradeResult.data) {
        await this.analyzeJavaScriptFiles(tradeResult.data);
      }
      
      // Step 3: Test common endpoints
      await this.testAPIEndpoints();
      
      // Step 4: Test trade search
      await this.testTradeSearch();

      console.log('\n' + '='.repeat(50));
      console.log('✅ Analysis complete!');
      
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
    }
  }
}

// Run the analyzer
if (require.main === module) {
  const analyzer = new POE2TradeAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = POE2TradeAnalyzer;