import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { session_id } = req.query || {};
  if (!session_id) return res.status(400).json({ error: 'session_id is required' });

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // basic guard
    if (!session || session.payment_status !== 'paid') {
      return res.status(200).json({ status: 'pending', message: 'Session not paid yet', session });
    }

    const propertyId = session.metadata?.propertyId;
    const checkInDate = session.metadata?.checkInDate;
    const checkOutDate = session.metadata?.checkOutDate;
    const guestName = session.metadata?.guestName;
    const guestEmail = session.metadata?.guestEmail;

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    const headers = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    };

    // Upsert booking by unique (property_id, check_in, check_out, guest_email)
    const bookingBody = {
      property_id: propertyId,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      total_price: session.amount_total ? session.amount_total / 100 : null,
      guest_name: guestName,
      guest_email: guestEmail,
      status: 'confirmed'
    };

    await fetch(`${supabaseUrl}/rest/v1/bookings`, { method: 'POST', headers, body: JSON.stringify(bookingBody) });

    // Close dates
    if (checkInDate && checkOutDate) {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const entries = [];
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        entries.push({ property_id: propertyId, date: d.toISOString().split('T')[0], is_available: false, notes: 'Blocked by booking (session confirm)' });
      }
      if (entries.length) {
        await fetch(`${supabaseUrl}/rest/v1/property_calendar`, { method: 'POST', headers, body: JSON.stringify(entries) });
      }
    }

    return res.status(200).json({ status: 'confirmed' });
  } catch (err) {
    console.error('Confirm booking error', err);
    return res.status(500).json({ error: 'Failed to confirm booking', details: err.message });
  }
}


