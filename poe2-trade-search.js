// POE2 Trade Search Tool
// ทดสอบการค้นหา items เหมือนที่ POE2 overlays ทำ

const https = require('https');
const zlib = require('zlib');
const fs = require('fs');

class POE2TradeSearch {
  constructor() {
    this.baseUrl = 'www.pathofexile.com';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Referer': 'https://www.pathofexile.com/trade2',
      'Origin': 'https://www.pathofexile.com'
    };
    
    // Load cached data
    this.itemsData = null;
    this.statsData = null;
    this.loadCachedData();
  }

  loadCachedData() {
    try {
      if (fs.existsSync('./poe2-items-data.json')) {
        this.itemsData = JSON.parse(fs.readFileSync('./poe2-items-data.json', 'utf8'));
        console.log('✅ Items data loaded from cache');
      }
      if (fs.existsSync('./poe2-stats-data.json')) {
        this.statsData = JSON.parse(fs.readFileSync('./poe2-stats-data.json', 'utf8'));
        console.log('✅ Stats data loaded from cache');
      }
    } catch (error) {
      console.log('⚠️  Error loading cached data:', error.message);
    }
  }

  // Enhanced POST request with proper compression handling
  async postRequest(endpoint, body, options = {}) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(body);
      
      const requestOptions = {
        hostname: this.baseUrl,
        path: endpoint,
        method: 'POST',
        headers: {
          ...this.headers,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...options.headers
        }
      };

      const req = https.request(requestOptions, (res) => {
        let rawData = [];
        res.on('data', (chunk) => rawData.push(chunk));
        
        res.on('end', () => {
          const buffer = Buffer.concat(rawData);
          
          // Handle different compression types
          const handleData = (data) => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: data,
              success: res.statusCode === 200
            });
          };

          if (res.headers['content-encoding'] === 'gzip') {
            zlib.gunzip(buffer, (err, decompressed) => {
              if (err) {
                console.log('❌ Gzip decompression error:', err.message);
                resolve({
                  statusCode: res.statusCode,
                  headers: res.headers,
                  data: buffer.toString(),
                  success: false,
                  error: 'Decompression failed'
                });
              } else {
                handleData(decompressed.toString('utf8'));
              }
            });
          } else if (res.headers['content-encoding'] === 'deflate') {
            zlib.inflate(buffer, (err, decompressed) => {
              if (err) {
                console.log('❌ Deflate decompression error:', err.message);
                resolve({
                  statusCode: res.statusCode,
                  headers: res.headers,
                  data: buffer.toString(),
                  success: false,
                  error: 'Decompression failed'
                });
              } else {
                handleData(decompressed.toString('utf8'));
              }
            });
          } else if (res.headers['content-encoding'] === 'br') {
            zlib.brotliDecompress(buffer, (err, decompressed) => {
              if (err) {
                console.log('❌ Brotli decompression error:', err.message);
                resolve({
                  statusCode: res.statusCode,
                  headers: res.headers,
                  data: buffer.toString(),
                  success: false,
                  error: 'Decompression failed'
                });
              } else {
                handleData(decompressed.toString('utf8'));
              }
            });
          } else {
            handleData(buffer.toString('utf8'));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(15000, () => reject(new Error('Request timeout')));
      req.write(postData);
      req.end();
    });
  }

  // Search for specific item types
  async searchItems(league = 'Standard', query = {}) {
    console.log(`\n🔍 Searching items in league: ${league}`);
    console.log('Query:', JSON.stringify(query, null, 2));

    const endpoint = `/api/trade2/search/${encodeURIComponent(league)}`;
    
    try {
      const response = await this.postRequest(endpoint, { query });
      
      console.log(`Response status: ${response.statusCode}`);
      console.log(`Content-Encoding: ${response.headers['content-encoding']}`);
      console.log(`Response length: ${response.data?.length || 0}`);
      
      if (response.success) {
        try {
          const result = JSON.parse(response.data);
          console.log('✅ Search successful!');
          console.log(`📊 Search result structure:`, Object.keys(result));
          
          if (result.id && result.result) {
            console.log(`🎯 Query ID: ${result.id}`);
            console.log(`📦 Found ${result.result.length} items`);
            console.log(`🔢 Total results: ${result.total || 'unknown'}`);
            
            // Show first few result IDs
            if (result.result.length > 0) {
              console.log(`📝 First few result IDs:`, result.result.slice(0, 5));
            }
            
            return result;
          } else {
            console.log('❓ Unexpected response format');
            console.log('Response preview:', response.data.substring(0, 200));
            return result;
          }
        } catch (parseError) {
          console.log('❌ Failed to parse JSON response');
          console.log('Raw response preview:', response.data.substring(0, 500));
          return null;
        }
      } else {
        console.log(`❌ Search failed with status ${response.statusCode}`);
        if (response.error) {
          console.log(`Error: ${response.error}`);
        }
        return null;
      }
    } catch (error) {
      console.log('❌ Request failed:', error.message);
      return null;
    }
  }

  // Search for weapons
  async searchWeapons(league = 'Standard') {
    console.log('\n⚔️  Searching for weapons...');
    
    const queries = [
      {
        status: { option: 'online' },
        filters: {
          type_filters: {
            filters: {
              category: { option: 'weapon.sword' }
            }
          }
        }
      },
      {
        status: { option: 'online' },
        type: 'Iron Sword'
      },
      {
        status: { option: 'online' },
        filters: {
          weapon_filters: {
            filters: {
              dps: { min: 100 }
            }
          }
        }
      }
    ];

    for (let i = 0; i < queries.length; i++) {
      console.log(`\n--- Weapon Search ${i + 1} ---`);
      const result = await this.searchItems(league, queries[i]);
      
      if (result && result.result && result.result.length > 0) {
        console.log('🎯 Found weapons! Trying to fetch details...');
        await this.fetchItemDetails(result.id, result.result.slice(0, 3));
        break;
      }
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Search for armor
  async searchArmor(league = 'Standard') {
    console.log('\n🛡️  Searching for armor...');
    
    const queries = [
      {
        status: { option: 'online' },
        filters: {
          type_filters: {
            filters: {
              category: { option: 'armour.chest' }
            }
          }
        }
      },
      {
        status: { option: 'online' },
        type: 'Chain Vest'
      }
    ];

    for (let i = 0; i < queries.length; i++) {
      console.log(`\n--- Armor Search ${i + 1} ---`);
      const result = await this.searchItems(league, queries[i]);
      
      if (result && result.result && result.result.length > 0) {
        console.log('🎯 Found armor! Trying to fetch details...');
        await this.fetchItemDetails(result.id, result.result.slice(0, 3));
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Fetch detailed item information
  async fetchItemDetails(queryId, itemIds) {
    if (!itemIds || itemIds.length === 0) {
      console.log('❌ No item IDs provided');
      return;
    }

    console.log(`\n📦 Fetching details for ${itemIds.length} items...`);
    console.log(`Query ID: ${queryId}`);
    console.log(`Item IDs: ${itemIds.join(', ')}`);

    const endpoint = `/api/trade2/fetch/${itemIds.join(',')}?query=${queryId}`;
    
    try {
      const response = await this.getRequest(endpoint);
      
      if (response.success) {
        try {
          const result = JSON.parse(response.data);
          console.log('✅ Item details fetched successfully!');
          
          if (result.result) {
            console.log(`📊 Found ${result.result.length} item details:`);
            
            result.result.forEach((item, index) => {
              if (item) {
                console.log(`\n--- Item ${index + 1} ---`);
                console.log(`ID: ${item.id}`);
                if (item.item) {
                  console.log(`Name: ${item.item.name || 'Unknown'}`);
                  console.log(`Type: ${item.item.typeLine || 'Unknown'}`);
                  console.log(`Level: ${item.item.ilvl || 'Unknown'}`);
                  if (item.listing && item.listing.price) {
                    console.log(`Price: ${item.listing.price.amount} ${item.listing.price.currency}`);
                  }
                }
              }
            });
            
            return result;
          }
        } catch (parseError) {
          console.log('❌ Failed to parse item details');
          console.log('Response preview:', response.data.substring(0, 300));
        }
      } else {
        console.log(`❌ Failed to fetch item details: ${response.statusCode}`);
      }
    } catch (error) {
      console.log('❌ Error fetching item details:', error.message);
    }

    return null;
  }

  // GET request helper with compression support
  async getRequest(endpoint) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        path: endpoint,
        method: 'GET',
        headers: this.headers
      };

      const req = https.request(options, (res) => {
        let rawData = [];
        res.on('data', (chunk) => rawData.push(chunk));
        
        res.on('end', () => {
          const buffer = Buffer.concat(rawData);
          
          const handleData = (data) => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: data,
              success: res.statusCode === 200
            });
          };

          if (res.headers['content-encoding'] === 'gzip') {
            zlib.gunzip(buffer, (err, decompressed) => {
              if (err) {
                resolve({ statusCode: res.statusCode, success: false, error: 'Decompression failed' });
              } else {
                handleData(decompressed.toString('utf8'));
              }
            });
          } else {
            handleData(buffer.toString('utf8'));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => reject(new Error('Timeout')));
      req.end();
    });
  }

  // Show available item categories
  showItemCategories() {
    if (!this.itemsData || !this.itemsData.result) {
      console.log('❌ No items data available');
      return;
    }

    console.log('\n📂 Available Item Categories:');
    this.itemsData.result.forEach((category, index) => {
      console.log(`\n${index + 1}. ${category.label || category.id} (${category.entries?.length || 0} items)`);
      
      if (category.entries && category.entries.length > 0) {
        console.log('   Examples:');
        category.entries.slice(0, 5).forEach(item => {
          console.log(`   - ${item.type || item.text || item.name}`);
        });
        if (category.entries.length > 5) {
          console.log(`   ... and ${category.entries.length - 5} more`);
        }
      }
    });
  }

  // Main test function
  async runTests() {
    console.log('🚀 Starting POE2 Trade Search Tests');
    console.log('='.repeat(50));

    // Show available data
    this.showItemCategories();

    // Test searches
    await this.searchWeapons('Standard');
    await this.searchArmor('Standard');
    
    // Test currency search
    console.log('\n💰 Testing currency search...');
    const currencyResult = await this.searchItems('Standard', {
      status: { option: 'online' },
      type: 'Divine Orb'
    });

    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests completed!');
  }
}

// Run the tests
if (require.main === module) {
  const searcher = new POE2TradeSearch();
  searcher.runTests().catch(console.error);
}

module.exports = POE2TradeSearch;