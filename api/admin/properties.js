import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { property, images } = req.body || {};

    if (!property || !property.title || !property.city || !property.base_price) {
      return res.status(400).json({ error: 'Missing required fields: title, city, base_price' });
    }

    // Insert property
    const { data: inserted, error: insertError } = await adminClient
      .from('properties')
      .insert([{ ...property }])
      .select()
      .single();

    if (insertError) {
      return res.status(400).json({ error: insertError.message, details: insertError });
    }

    // Optional image rows
    if (Array.isArray(images) && images.length > 0) {
      const rows = images.map((img, idx) => ({
        property_id: inserted.id,
        image_url: img.url || img.image_url,
        display_order: typeof img.display_order === 'number' ? img.display_order : idx,
        is_primary: idx === 0
      }));
      const { error: imgErr } = await adminClient.from('property_images').insert(rows);
      if (imgErr) {
        // Do not fail the entire request if images fail
        console.warn('property_images insert error:', imgErr);
      }
    }

    return res.status(200).json({ property: inserted });
  } catch (err) {
    console.error('Admin properties handler error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}


