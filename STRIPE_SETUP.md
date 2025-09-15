# 🚀 Real Stripe Sandbox Payments Setup

This guide will help you set up real Stripe payments so you can see actual transactions in your Stripe sandbox dashboard.

## 📋 Prerequisites

- Node.js installed on your machine
- Your Stripe test keys (already configured in the code)
- The apartment booking app running

## 🛠️ Setup Steps

### 1. Install API Server Dependencies

```bash
# Copy the API package.json to your project root
cp api-package.json package.json

# Install dependencies
npm install
```

### 2. Start the API Server

```bash
# Start the Stripe API server
npm start
```

You should see:
```
🚀 Stripe API server running on http://localhost:3001
📝 Create payment intent: POST http://localhost:3001/api/create-payment-intent
🔍 Health check: GET http://localhost:3001/health
```

### 3. Test the API Server

Open a new terminal and test the health endpoint:
```bash
curl http://localhost:3001/health
```

Should return: `{"status":"OK","message":"Stripe API server is running"}`

## 🧪 Testing Real Payments

### 1. Start Your Main App
```bash
npm run dev
```

### 2. Go to a Booking Page
Navigate to any apartment booking page (e.g., `/book/[apartment-id]`)

### 3. Select Dates and Proceed to Payment
- Use the calendar to select check-in and check-out dates
- Fill in guest information
- Click "Book Now"

### 4. Choose Payment Option
- **50% Online + 50% Cash**: Pay half now, half on arrival
- **100% Online**: Pay everything now

### 5. Use Test Card Numbers
Enter these test card details:

| Card Number | Brand | Result | CVC | Expiry |
|-------------|-------|---------|-----|---------|
| `4242 4242 4242 4242` | Visa | ✅ Success | `123` | `12/25` |
| `4000 0000 0000 0002` | Visa | ❌ Declined | `123` | `12/25` |
| `4000 0025 0000 3155` | Visa | 🔐 Requires Auth | `123` | `12/25` |

## 📊 What You'll See in Stripe Dashboard

After successful payments, you'll see in your Stripe sandbox dashboard:

### Payments Section
- ✅ **Payment Intents** with real amounts
- ✅ **Transaction IDs** (e.g., `pi_3Oq...`)
- ✅ **Payment Status**: `succeeded`
- ✅ **Amount**: Real dollar amounts (in cents)

### Metadata
- `paymentType`: `partial` or `full`
- `bookingType`: `apartment_booking`
- `paymentMethod`: `partial_online` or `full_online`

## 🔍 Troubleshooting

### API Server Not Starting
```bash
# Check if port 3001 is in use
netstat -an | grep 3001

# Kill process using port 3001 (Windows)
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### CORS Issues
The API server includes CORS headers. If you still get CORS errors, check that the API server is running on `http://localhost:3001`.

### Stripe Errors
- Verify your secret key is correct in `api-server.js`
- Check Stripe dashboard for error logs
- Ensure you're using test keys, not live keys

## 🎯 Next Steps

1. **Test both payment options** (50% vs 100%)
2. **Check your Stripe dashboard** for real transactions
3. **Try declined cards** to test error handling
4. **Test with different amounts** to see various transaction sizes

## 🔐 Security Notes

- **Never commit real Stripe keys** to version control
- **Use environment variables** in production
- **This is for testing only** - don't use in production without proper security

## 📱 Production Deployment

When ready for production:
1. Replace test keys with live keys
2. Use environment variables for sensitive data
3. Deploy API server to a secure hosting service
4. Update frontend API URLs to production endpoints
5. Implement proper authentication and rate limiting

---

**Happy testing! 🎉** You should now see real transactions in your Stripe sandbox dashboard.








