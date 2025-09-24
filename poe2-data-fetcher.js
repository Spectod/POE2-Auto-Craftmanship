// POE2 API Data Fetcher
// ดึงและ parse ข้อมูลจาก POE2 Trade APIs ที่พบ

const https = require('https');
const fs = require('fs');
const zlib = require('zlib');

class POE2DataFetcher {
  constructor() {
    this.baseUrl = 'www.pathofexile.com';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive'
    };
  }

  // Fetch and decompress data from endpoint
  async fetchData(endpoint) {
    console.log(`\n🔄 Fetching: ${endpoint}`);
    
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        path: endpoint,
        method: 'GET',
        headers: this.headers
      };

      const req = https.request(options, (res) => {
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Content-Encoding: ${res.headers['content-encoding']}`);
        
        let rawData = [];
        res.on('data', (chunk) => rawData.push(chunk));
        
        res.on('end', () => {
          const buffer = Buffer.concat(rawData);
          
          // Handle gzip compression
          if (res.headers['content-encoding'] === 'gzip') {
            zlib.gunzip(buffer, (err, decompressed) => {
              if (err) {
                reject(err);
              } else {
                resolve(decompressed.toString('utf8'));
              }
            });
          } else {
            resolve(buffer.toString('utf8'));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => reject(new Error('Request timeout')));
      req.end();
    });
  }

  // Parse POE2 leagues data
  async getLeagues() {
    try {
      const data = await this.fetchData('/api/leagues?realm=poe2');
      console.log('\n📊 POE2 Leagues Data:');
      console.log('Raw data length:', data.length);
      
      try {
        const leagues = JSON.parse(data);
        console.log('\n🎮 Available POE2 Leagues:');
        leagues.forEach((league, index) => {
          console.log(`${index + 1}. ${league.id} - ${league.description || 'No description'}`);
          if (league.rules) {
            console.log(`   Rules: ${league.rules.map(r => r.name).join(', ')}`);
          }
        });
        return leagues;
      } catch (e) {
        console.log('Failed to parse as JSON, showing raw data:');
        console.log(data.substring(0, 500) + '...');
        return null;
      }
    } catch (error) {
      console.error('Error fetching leagues:', error.message);
      return null;
    }
  }

  // Parse POE2 items data
  async getItems() {
    try {
      const data = await this.fetchData('/api/trade2/data/items');
      console.log('\n📦 POE2 Items Data:');
      console.log('Raw data length:', data.length);
      
      // Try to parse as JSON
      try {
        const items = JSON.parse(data);
        
        if (items.result) {
          console.log('\n🔧 Item Categories:');
          Object.keys(items.result).forEach(category => {
            const categoryItems = items.result[category];
            console.log(`\n📂 ${category}: ${categoryItems.length} items`);
            
            // Show first few items as examples
            if (categoryItems.length > 0) {
              console.log('   Examples:');
              categoryItems.slice(0, 5).forEach(item => {
                console.log(`   - ${item.text || item.name || item.id} (${item.type || 'unknown'})`);
              });
              
              if (categoryItems.length > 5) {
                console.log(`   ... and ${categoryItems.length - 5} more`);
              }
            }
          });
          
          // Save to file for detailed analysis
          fs.writeFileSync('./poe2-items-data.json', JSON.stringify(items, null, 2));
          console.log('\n💾 Full items data saved to: poe2-items-data.json');
          
          return items;
        } else {
          console.log('Unexpected JSON structure:', Object.keys(items));
          return items;
        }
      } catch (e) {
        console.log('Failed to parse as JSON, trying as text...');
        
        // Look for patterns in text data
        const lines = data.split('\n').filter(line => line.trim());
        console.log(`Found ${lines.length} lines of data`);
        
        // Show first few lines
        console.log('\nFirst 10 lines:');
        lines.slice(0, 10).forEach((line, index) => {
          console.log(`${index + 1}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
        });
        
        return data;
      }
    } catch (error) {
      console.error('Error fetching items:', error.message);
      return null;
    }
  }

  // Parse POE2 stats data
  async getStats() {
    try {
      const data = await this.fetchData('/api/trade2/data/stats');
      console.log('\n📈 POE2 Stats Data:');
      console.log('Raw data length:', data.length);
      
      try {
        const stats = JSON.parse(data);
        
        if (stats.result) {
          console.log('\n🔢 Stat Categories:');
          Object.keys(stats.result).forEach(category => {
            const categoryStats = stats.result[category];
            console.log(`\n📊 ${category}: ${categoryStats.length} stats`);
            
            // Show examples
            if (categoryStats.length > 0) {
              console.log('   Examples:');
              categoryStats.slice(0, 5).forEach(stat => {
                console.log(`   - ${stat.text || stat.name || stat.id}`);
                if (stat.type) console.log(`     Type: ${stat.type}`);
              });
              
              if (categoryStats.length > 5) {
                console.log(`   ... and ${categoryStats.length - 5} more`);
              }
            }
          });
          
          // Save to file
          fs.writeFileSync('./poe2-stats-data.json', JSON.stringify(stats, null, 2));
          console.log('\n💾 Full stats data saved to: poe2-stats-data.json');
          
          return stats;
        } else {
          console.log('Unexpected JSON structure:', Object.keys(stats));
          return stats;
        }
      } catch (e) {
        console.log('Failed to parse as JSON');
        console.log('First 500 chars:', data.substring(0, 500));
        return data;
      }
    } catch (error) {
      console.error('Error fetching stats:', error.message);
      return null;
    }
  }

  // Try to find search endpoints with proper league names
  async testSearchEndpoints() {
    console.log('\n🔍 Testing search endpoints with real league names...\n');
    
    // First get league names
    const leagues = await this.getLeagues();
    if (!leagues || !leagues.length) {
      console.log('❌ No leagues found, using default names');
      return;
    }

    const leagueNames = leagues.map(l => l.id);
    console.log('Found leagues:', leagueNames);

    // Test search endpoints with real league names
    const searchBodies = [
      {
        query: {
          status: { option: 'online' },
          filters: {
            type_filters: {
              filters: {
                category: { option: 'weapon' }
              }
            }
          }
        }
      },
      {
        query: {
          status: { option: 'online' },
          name: 'Divine Orb'
        }
      }
    ];

    for (const leagueName of leagueNames.slice(0, 2)) { // Test first 2 leagues
      const encodedLeague = encodeURIComponent(leagueName);
      const endpoints = [
        `/api/trade2/search/${encodedLeague}`,
        `/api/trade/search/${encodedLeague}`
      ];

      for (const endpoint of endpoints) {
        for (const body of searchBodies) {
          try {
            console.log(`🧪 Testing: POST ${endpoint}`);
            const result = await this.postData(endpoint, body);
            
            if (result.success) {
              console.log(`✅ SUCCESS! Found working search endpoint!`);
              console.log(`   Endpoint: ${endpoint}`);
              console.log(`   Response:`, result.data.substring(0, 300) + '...');
              
              // Try to parse response
              try {
                const json = JSON.parse(result.data);
                console.log(`   📊 Response structure:`, Object.keys(json));
                if (json.result) {
                  console.log(`   🎯 Found ${json.result.length} results!`);
                }
              } catch (e) {
                console.log(`   📄 Non-JSON response`);
              }
              
              return { endpoint, body, response: result.data };
            } else {
              console.log(`   ❌ Status: ${result.statusCode}`);
            }
          } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    console.log('❌ No working search endpoints found');
    return null;
  }

  // POST request helper
  async postData(endpoint, body) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(body);
      
      const options = {
        hostname: this.baseUrl,
        path: endpoint,
        method: 'POST',
        headers: {
          ...this.headers,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          resolve({
            success: res.statusCode === 200,
            statusCode: res.statusCode,
            data: data,
            headers: res.headers
          });
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => reject(new Error('Timeout')));
      req.write(postData);
      req.end();
    });
  }

  // Main analysis function
  async analyze() {
    console.log('🚀 Starting POE2 Data Analysis');
    console.log('='.repeat(50));

    try {
      // Get all available data
      const leagues = await this.getLeagues();
      const items = await this.getItems();
      const stats = await this.getStats();
      
      // Try to find working search endpoints
      await this.testSearchEndpoints();
      
      console.log('\n' + '='.repeat(50));
      console.log('✅ Data analysis complete!');
      console.log('\n📋 Summary:');
      console.log(`- Leagues: ${leagues ? leagues.length : 0} found`);
      console.log(`- Items data: ${items ? 'Available' : 'Failed'}`);
      console.log(`- Stats data: ${stats ? 'Available' : 'Failed'}`);
      
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
    }
  }
}

// Run the analyzer
if (require.main === module) {
  const fetcher = new POE2DataFetcher();
  fetcher.analyze().catch(console.error);
}

module.exports = POE2DataFetcher;