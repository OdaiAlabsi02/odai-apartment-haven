// Simple test script to verify Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zwgnhwnrlekinkvpchhs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3Z25od25ybGVraW5rdnBjaGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTEyNjksImV4cCI6MjA2NzYyNzI2OX0.9ybNKhkQW6U7Soml3DftRDUpkiW6MNLv7YH1N60HT6s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  console.log('Key exists:', !!supabaseKey);
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('properties')
      .select('id, title, city, base_price')
      .limit(2);
    
    if (error) {
      console.error('❌ Connection failed:', error);
      return;
    }
    
    console.log('✅ Connection successful!');
    console.log('Found properties:', data.length);
    data.forEach(prop => {
      console.log(`- ${prop.title} (${prop.city}) - $${prop.base_price}`);
    });
    
  } catch (err) {
    console.error('❌ Connection error:', err.message);
  }
}

testConnection();
