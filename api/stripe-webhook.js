import Stripe from 'stripe';

export const config = {
  api: {
    bodyParser: false,
  },
};

function buffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const propertyId = session.metadata?.propertyId;
      const nights = Number(session.metadata?.nights || '0');
      const checkInDate = session.metadata?.checkInDate;
      const checkOutDate = session.metadata?.checkOutDate;
      const guestName = session.metadata?.guestName;
      const guestEmail = session.metadata?.guestEmail;

      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

      const headers = {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      };

      await fetch(`${supabaseUrl}/rest/v1/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          property_id: propertyId,
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          total_price: session.amount_total ? session.amount_total / 100 : null,
          guest_name: guestName,
          guest_email: guestEmail,
          status: 'confirmed'
        })
      });

      if (checkInDate && checkOutDate) {
        const start = new Date(checkInDate);
        const end = new Date(checkOutDate);
        const entries = [];
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
          entries.push({ property_id: propertyId, date: d.toISOString().split('T')[0], is_available: false, notes: 'Blocked by booking' });
        }
        if (entries.length) {
          await fetch(`${supabaseUrl}/rest/v1/property_calendar`, {
            method: 'POST',
            headers,
            body: JSON.stringify(entries)
          });
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Error handling webhook:', err);
    res.status(500).json({ error: 'Internal webhook handler error', details: err.message });
  }
}


