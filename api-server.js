import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51Rlt0pIrUFR8gQf0UBgEKCtNL3Ronwgq5AiegefayeHvQrnhmu30QlEw2pT09RPsqqwRHz2CoosvJBpJhFDhekV000dnSIZB6v');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create Payment Intent endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, paymentType, metadata } = req.body;
    
    if (!amount || !currency) {
      return res.status(400).json({ error: 'Amount and currency are required' });
    }
    
    console.log('Creating payment intent:', { amount, currency, paymentType, metadata });
    
    // Create Payment Intent with enhanced configuration for all card types
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        paymentType: paymentType || 'partial',
        ...metadata,
      },
      // Simple configuration that works with all card types
      payment_method_types: ['card'],
      capture_method: 'automatic',
      setup_future_usage: 'off_session',
    });
    
    console.log('Payment intent created successfully:', paymentIntent.id);
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
    
  } catch (error) {
    console.error('Stripe error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      decline_code: error.decline_code,
      param: error.param,
      request_id: error.request_id
    });
    
    // Provide more helpful error messages
    let userMessage = 'Payment failed. Please try again.';
    
    if (error.type === 'card_error') {
      switch (error.code) {
        case 'card_declined':
          userMessage = `Card was declined: ${error.decline_code || 'Unknown reason'}`;
          break;
        case 'expired_card':
          userMessage = 'Card has expired. Please use a different card.';
          break;
        case 'incorrect_cvc':
          userMessage = 'Incorrect CVC. Please check and try again.';
          break;
        case 'incorrect_number':
          userMessage = 'Incorrect card number. Please check and try again.';
          break;
        case 'insufficient_funds':
          userMessage = 'Insufficient funds on card. Please try a different card.';
          break;
        case 'invalid_cvc':
          userMessage = 'Invalid CVC. Please check and try again.';
          break;
        case 'invalid_expiry_month':
          userMessage = 'Invalid expiry month. Please check and try again.';
          break;
        case 'invalid_expiry_year':
          userMessage = 'Invalid expiry year. Please check and try again.';
          break;
        case 'invalid_number':
          userMessage = 'Invalid card number. Please check and try again.';
          break;
        default:
          userMessage = `Card error: ${error.message}`;
      }
    } else if (error.type === 'validation_error') {
      userMessage = `Validation error: ${error.message}`;
    } else if (error.type === 'rate_limit_error') {
      userMessage = 'Too many requests. Please wait a moment and try again.';
    } else if (error.type === 'invalid_request_error') {
      userMessage = `Invalid request: ${error.message}`;
    } else if (error.type === 'api_error') {
      userMessage = 'Payment service temporarily unavailable. Please try again.';
    } else if (error.type === 'authentication_error') {
      userMessage = 'Authentication failed. Please refresh and try again.';
    }
    
    res.status(500).json({ 
      error: userMessage,
      details: error.message,
      type: error.type,
      code: error.code
    });
  }
});

// Refund Payment endpoint
app.post('/api/refund-payment', async (req, res) => {
  try {
    const { paymentIntentId, amount, reason } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment Intent ID is required' });
    }
    
    console.log('Processing refund:', { paymentIntentId, amount, reason });
    
    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents, undefined = full refund
      reason: reason || 'requested_by_customer',
      metadata: {
        refund_type: amount ? 'partial' : 'full',
        processed_at: new Date().toISOString()
      }
    });
    
    console.log('Refund created successfully:', refund.id);
    
    res.json({
      refundId: refund.id,
      amount: refund.amount,
      status: refund.status,
      reason: refund.reason
    });
    
  } catch (error) {
    console.error('Refund error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param
    });
    
    let userMessage = 'Refund failed. Please try again.';
    
    if (error.type === 'invalid_request_error') {
      if (error.message.includes('already been refunded')) {
        userMessage = 'This payment has already been refunded.';
      } else if (error.message.includes('not found')) {
        userMessage = 'Payment not found. Please check the payment details.';
      } else {
        userMessage = `Invalid request: ${error.message}`;
      }
    } else if (error.type === 'api_error') {
      userMessage = 'Refund service temporarily unavailable. Please try again.';
    } else if (error.type === 'authentication_error') {
      userMessage = 'Authentication failed. Please refresh and try again.';
    }
    
    res.status(500).json({ 
      error: userMessage,
      details: error.message,
      type: error.type,
      code: error.code
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Stripe API server is running',
    supported_payment_methods: ['card', 'link', 'us_bank_account'],
    supported_currencies: ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy'],
    card_networks: ['visa', 'mastercard', 'amex', 'discover', 'diners_club', 'jcb', 'unionpay']
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Stripe API server running on http://localhost:${PORT}`);
  console.log(`📝 Create payment intent: POST http://localhost:${PORT}/api/create-payment-intent`);
  console.log(`💰 Process refund: POST http://localhost:${PORT}/api/refund-payment`);
  console.log(`🔍 Health check: GET http://localhost:${PORT}/health`);
  console.log(`💳 Supporting all major card networks: Visa, Mastercard, Amex, Discover, Diners Club, JCB, UnionPay`);
});
