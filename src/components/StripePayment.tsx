import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Load Stripe outside of component to avoid recreating on every render
const stripePromise = loadStripe('pk_test_51Rlt0pIrUFR8gQf0WkrfZHRSdwjpYCTiEIx5CVs21iAd0zzVFrLEupNzoq9BwdeyReyfKX4QKuz8VH7Qm9LTWJkU00Vkf0gWlR');

interface StripePaymentProps {
  totalAmount: number;
  currency: string;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
}

interface PaymentFormProps {
  totalAmount: number;
  currency: string;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  totalAmount, 
  currency, 
  onPaymentSuccess, 
  onPaymentError 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const [isProcessing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'initial' | 'processing' | 'success'>('initial');
  const [paymentType, setPaymentType] = useState<'partial' | 'full'>('partial');

  // Calculate amounts based on payment type
  const onlineAmount = paymentType === 'partial' ? Math.round(totalAmount * 0.5) : totalAmount;
  const cashAmount = paymentType === 'partial' ? totalAmount - onlineAmount : 0;

  const handleStripePayment = async () => {
    if (!stripe || !elements) {
      onPaymentError('Stripe has not loaded yet. Please try again.');
      return;
    }

    // Store payment type in localStorage for the booking page to access
    localStorage.setItem('selectedPaymentType', paymentType);

    setProcessing(true);
    setPaymentStep('processing');

    try {
      // 1. Create Payment Intent on your backend
      const response = await fetch('http://localhost:3001/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: onlineAmount,
          currency: currency,
          paymentType: paymentType,
          metadata: {
            bookingType: 'apartment_booking',
            paymentMethod: paymentType === 'partial' ? 'partial_online' : 'full_online'
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }
      
      const { clientSecret, paymentIntentId } = await response.json();
      
      // 2. Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          // Removed billing_details to eliminate postal code requirement
        }
      });
      
      if (error) {
        // Enhanced error handling for different card types
        let errorMessage = error.message;
        
        if (error.code === 'card_declined') {
          switch (error.decline_code) {
            case 'generic_decline':
              errorMessage = 'Your card was declined. Please try a different card.';
              break;
            case 'insufficient_funds':
              errorMessage = 'Insufficient funds on your card. Please try a different card.';
              break;
            case 'lost_card':
              errorMessage = 'This card has been reported lost. Please use a different card.';
              break;
            case 'stolen_card':
              errorMessage = 'This card has been reported stolen. Please use a different card.';
              break;
            case 'expired_card':
              errorMessage = 'This card has expired. Please use a different card.';
              break;
            case 'incorrect_cvc':
              errorMessage = 'Incorrect CVC. Please check and try again.';
              break;
            case 'processing_error':
              errorMessage = 'An error occurred while processing your card. Please try again.';
              break;
            case 'card_not_supported':
              errorMessage = 'This card type is not supported. Please use Visa, Mastercard, American Express, or Discover.';
              break;
            default:
              errorMessage = `Card declined: ${error.decline_code || 'Unknown reason'}. Please try a different card.`;
          }
        } else if (error.code === 'invalid_request_error') {
          errorMessage = 'Invalid card information. Please check your details and try again.';
        } else if (error.code === 'authentication_required') {
          errorMessage = 'Your card requires authentication. Please try again or use a different card.';
        }
        
        throw new Error(errorMessage);
      }
      
      // 3. Payment successful
      setPaymentStep('success');
      
      // Show success toast based on payment type
      if (paymentType === 'partial') {
        toast({
          title: "Payment Successful!",
          description: `Online payment of $${onlineAmount} completed. Please bring $${cashAmount} cash on arrival.`,
        });
      } else {
        toast({
          title: "Payment Successful!",
          description: `Full payment of $${onlineAmount} completed. No additional payment required.`,
        });
      }
      
      // Call success callback with real payment ID
      setTimeout(() => {
        onPaymentSuccess(paymentIntent.id);
      }, 1500);
      
    } catch (error) {
      setProcessing(false);
      setPaymentStep('initial');
      onPaymentError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true, // Hide postal code field
  };

  if (paymentStep === 'success') {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-green-800">Payment Successful!</h3>
        <p className="text-sm text-muted-foreground">
          {paymentType === 'partial' 
            ? 'Your online payment has been processed. Please bring the remaining cash on arrival.'
            : 'Your full payment has been processed. No additional payment required.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Type Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Choose Payment Option</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPaymentType('partial')}
            className={`p-3 border rounded-lg transition-all ${
              paymentType === 'partial'
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-1">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">50% Online</span>
              </div>
              <div className="text-xs text-muted-foreground">50% Cash on Arrival</div>
            </div>
          </button>
          
          <button
            onClick={() => setPaymentType('full')}
            className={`p-3 border rounded-lg transition-all ${
              paymentType === 'full'
                ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">100% Online</span>
              </div>
              <div className="text-xs text-muted-foreground">Pay Everything Now</div>
            </div>
          </button>
        </div>
      </div>

      {/* Payment Breakdown */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Payment Breakdown</h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="font-medium">Pay Online Now</span>
            </div>
            <Badge variant="default" className="bg-blue-600">
              ${onlineAmount.toFixed(2)}
            </Badge>
          </div>
          
          {paymentType === 'partial' && (
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-orange-600" />
                <span className="font-medium">Cash on Arrival</span>
              </div>
              <Badge variant="outline" className="border-orange-600 text-orange-600">
                ${cashAmount.toFixed(2)}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Card Input */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Card Details</label>
        <div className="p-3 border rounded-lg">
          <CardElement options={cardElementOptions} />
        </div>
        <p className="text-xs text-muted-foreground">
          {paymentType === 'partial' 
            ? `You will only be charged $${onlineAmount.toFixed(2)} now. The remaining $${cashAmount.toFixed(2)} is due in cash on arrival.`
            : `You will be charged the full amount of $${onlineAmount.toFixed(2)} now.`
          }
          <br />
          <span className="text-blue-600">💳 Only card number, expiry date, and CVC are required.</span>
          <br />
          <span className="text-green-600">✅ We accept: Visa, Mastercard, American Express, Discover, Diners Club, JCB, and UnionPay</span>
        </p>
      </div>

      {/* Payment Button */}
      <Button
        onClick={handleStripePayment}
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Clock className="w-4 h-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            {paymentType === 'partial' 
              ? `Pay ${onlineAmount.toFixed(2)} Online`
              : `Pay Full Amount $${onlineAmount.toFixed(2)}`
            }
          </>
        )}
      </Button>

      {/* Security Notice */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          🔒 Your payment is secured by Stripe. We never store your card details.
        </p>
      </div>
    </div>
  );
};

const StripePayment: React.FC<StripePaymentProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />
            Secure Payment
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete your booking with secure online payment
          </p>
        </CardHeader>
        <CardContent>
          <PaymentForm {...props} />
        </CardContent>
      </Card>
    </Elements>
  );
};

export default StripePayment;
