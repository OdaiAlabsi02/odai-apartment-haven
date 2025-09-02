const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Supabase configuration
const SUPABASE_URL = "https://zwgnhwnrlekinkvpchhs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3Z25od25ybGVraW5rdnBjaGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTEyNjksImV4cCI6MjA2NzYyNzI2OX0.9ybNKhkQW6U7Soml3DftRDUpkiW6MNLv7YH1N60HT6s";

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API Proxy is running' });
});

// Get all properties
app.get('/api/properties', async (req, res) => {
  try {
    console.log('Fetching properties from Supabase...');
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`Successfully fetched ${data?.length || 0} properties`);
    res.json(data || []);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get property by ID
app.get('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching property ${id} from Supabase...`);
    
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`Successfully fetched property ${id}`);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get property images
app.get('/api/properties/:id/images', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching images for property ${id}...`);
    
    const { data, error } = await supabase
      .from('property_images')
      .select('*')
      .eq('property_id', id)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`Successfully fetched ${data?.length || 0} images for property ${id}`);
    res.json(data || []);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get property amenities
app.get('/api/properties/:id/amenities', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching amenities for property ${id}...`);
    
    const { data, error } = await supabase
      .from('property_amenities')
      .select(`
        amenity_id,
        amenities!inner (
          name,
          icon
        )
      `)
      .eq('property_id', id);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`Successfully fetched ${data?.length || 0} amenities for property ${id}`);
    res.json(data || []);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Proxy server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🏠 Properties API: http://localhost:${PORT}/api/properties`);
});
