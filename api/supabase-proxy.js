// Vercel serverless function to proxy Supabase requests
// This helps bypass DNS issues by running the request from Vercel's edge network

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method = 'GET', endpoint = 'properties', select = '*', order = 'created_at.desc', limit = '100' } = req.query;
  
  try {
    const supabaseUrl = 'https://zwgnhwnrlekinkvpchhs.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3Z25od25ybGVraW5rdnBjaGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTEyNjksImV4cCI6MjA2NzYyNzI2OX0.9ybNKhkQW6U7Soml3DftRDUpkiW6MNLv7YH1N60HT6s';
    
    // Build the URL with query parameters
    const queryParams = new URLSearchParams({
      select,
      order,
      limit
    });
    
    const url = `${supabaseUrl}/rest/v1/${endpoint}?${queryParams.toString()}`;
    
    console.log(`Proxying ${method} request to: ${url}`);
    
    const response = await fetch(url, {
      method,
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });

    if (!response.ok) {
      console.error('Supabase proxy error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return res.status(response.status).json({
        error: 'Supabase request failed',
        status: response.status,
        statusText: response.statusText,
        details: errorText
      });
    }

    const data = await response.json();
    
    // Add CORS headers to the response
    res.setHeader('Content-Range', response.headers.get('Content-Range') || '');
    res.setHeader('X-Total-Count', response.headers.get('X-Total-Count') || '');
    
    console.log(`Successfully proxied request, returning ${Array.isArray(data) ? data.length : 1} items`);
    
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      type: error.constructor.name
    });
  }
}
