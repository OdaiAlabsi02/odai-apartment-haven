import Stripe from 'stripe';

// NOTE: For production, set STRIPE_SECRET_KEY as an environment variable in Vercel
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51Rlt0pIrUFR8gQf0UBgEKCtNL3Ronwgq5AiegefayeHvQrnhmu30QlEw2pT09RPsqqwRHz2CoosvJBpJhFDhekV000dnSIZB6v');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      unitAmountJod,
      nights,
      propertyId,
      propertyTitle,
      successUrl,
      cancelUrl,
      customerId,
      checkInDate,
      checkOutDate,
      guestName,
      guestEmail
    } = req.body || {};

    if (!unitAmountJod || !nights) {
      return res.status(400).json({ error: 'unitAmountJod and nights are required' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId || undefined,
      // Stripe Checkout supports wallets (Apple/Google Pay) automatically
      line_items: [
        {
          price_data: {
            currency: 'usd', // Use a supported currency. Map JOD to USD amount in test for now
            product_data: {
              name: `${propertyTitle || 'Apartment booking'} — ${nights} night${Number(nights) > 1 ? 's' : ''}`,
              metadata: { propertyId: String(propertyId || '') },
            },
            unit_amount: Math.round(Number(unitAmountJod) * 100),
          },
          quantity: Number(nights),
        },
      ],
      allow_promotion_codes: false,
      automatic_tax: { enabled: false },
      success_url: successUrl || `${req.headers.origin}/booking-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.origin}/apartment/${String(propertyId || '')}`,
      metadata: {
        propertyId: String(propertyId || ''),
        nights: String(nights || ''),
        checkInDate: checkInDate || '',
        checkOutDate: checkOutDate || '',
        guestName: guestName || '',
        guestEmail: guestEmail || ''
      }
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('Vercel function checkout error:', err);
    return res.status(500).json({ error: 'Failed to create checkout session', details: err.message });
  }
}


