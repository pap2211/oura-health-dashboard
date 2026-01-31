const https = require('https');
const { parse } = require('url');

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Oura-Token');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { endpoint } = req.query;
        const token = req.headers['x-oura-token'];

        if (!token) {
            res.status(400).json({ error: 'Missing X-Oura-Token header' });
            return;
        }

        if (!endpoint) {
            res.status(400).json({ error: 'Missing endpoint parameter' });
            return;
        }

        // Build the Oura API URL
        const parsedUrl = parse(req.url, true);
        const queryParams = new URLSearchParams();
        
        // Forward query parameters (except endpoint)
        Object.keys(parsedUrl.query).forEach(key => {
            if (key !== 'endpoint' && parsedUrl.query[key]) {
                queryParams.append(key, parsedUrl.query[key]);
            }
        });

        const queryString = queryParams.toString();
        const apiPath = `/v2/usercollection/${endpoint}${queryString ? `?${queryString}` : ''}`;
        
        console.log(`Proxying request to Oura API: ${apiPath}`);

        // Make request to Oura API
        const response = await makeOuraRequest(apiPath, token);
        
        res.status(200).json(response);

    } catch (error) {
        console.error('Proxy error:', error);
        
        if (error.statusCode === 401) {
            res.status(401).json({ error: 'Invalid API token' });
        } else if (error.statusCode === 429) {
            res.status(429).json({ error: 'Rate limit exceeded' });
        } else {
            res.status(500).json({ 
                error: 'Proxy request failed', 
                details: error.message 
            });
        }
    }
}

function makeOuraRequest(path, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.ouraring.com',
            port: 443,
            path: path,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'User-Agent': 'Oura-Dashboard-Vercel/1.0'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        const jsonData = JSON.parse(data);
                        resolve(jsonData);
                    } else {
                        const error = new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`);
                        error.statusCode = res.statusCode;
                        error.response = data;
                        reject(error);
                    }
                } catch (parseError) {
                    reject(new Error(`Failed to parse response: ${parseError.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}