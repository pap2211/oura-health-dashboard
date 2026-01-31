const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8003;
const OURA_API_BASE = 'https://api.ouraring.com/v2/usercollection';

// MIME types mapping
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon'
};

// Proxy function to handle Oura API requests
function proxyOuraRequest(req, res, apiPath, token) {
    const parsedUrl = url.parse(req.url, true);
    const queryString = new URLSearchParams(parsedUrl.query).toString();
    const fullPath = queryString ? `${apiPath}?${queryString}` : apiPath;
    const ouraUrl = `${OURA_API_BASE}${fullPath}`;

    console.log(`Proxying request to: ${ouraUrl}`);
    console.log(`Using token: ${token.substring(0, 10)}...`);

    const options = {
        hostname: 'api.ouraring.com',
        port: 443,
        path: `/v2/usercollection${fullPath}`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'User-Agent': 'Oura-Dashboard/1.0'
        }
    };

    const proxyReq = https.request(options, (proxyRes) => {
        console.log(`Oura API response status: ${proxyRes.statusCode}`);
        
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.setHeader('Content-Type', 'application/json');

        // Forward status code
        res.statusCode = proxyRes.statusCode;

        // Collect response data
        let data = '';
        proxyRes.on('data', chunk => {
            data += chunk;
        });

        proxyRes.on('end', () => {
            console.log(`Oura API response: ${data.substring(0, 200)}...`);
            res.end(data);
        });
    });

    proxyReq.on('error', (err) => {
        console.error('Proxy request error:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Proxy request failed', details: err.message }));
    });

    proxyReq.end();
}

const server = http.createServer((req, res) => {
    // Add CORS headers for all requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Oura-Token');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    // Handle Oura API proxy requests
    if (pathname.startsWith('/api/oura/')) {
        const token = req.headers['x-oura-token'];
        if (!token) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing X-Oura-Token header' }));
            return;
        }

        const apiPath = pathname.replace('/api/oura', '');
        proxyOuraRequest(req, res, apiPath, token);
        return;
    }
    
    // Serve static files
    if (pathname === '/') {
        pathname = '/index.html';
    }

    const filePath = path.join(__dirname, pathname);
    const ext = path.extname(pathname);
    const contentType = mimeTypes[ext] || 'text/plain';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
            return;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Oura Dashboard Server running on multiple addresses:`);
    console.log(`📱 Local: http://localhost:${PORT}/`);
    console.log(`🌐 Network: http://[YOUR-IP]:${PORT}/`);
    console.log(`🔧 API Test: http://[YOUR-IP]:${PORT}/test-proxy.html`);
    console.log('');
    console.log('✅ CORS proxy enabled for Oura API');
    console.log('🔒 Your API tokens are handled securely');
    console.log('📲 To find your IP address, run: ipconfig getifaddr en0 (Mac) or ifconfig (Linux)');
});