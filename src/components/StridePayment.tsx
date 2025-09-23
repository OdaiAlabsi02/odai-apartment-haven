import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, Handshake } from 'lucide-react';

interface StridePaymentProps {
  totalAmount: number;
  currency?: string;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
}

export default function StridePayment({ 
  totalAmount, 
  currency = 'USD', 
  onPaymentSuccess, 
  onPaymentError 
}: StridePaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'initial' | 'processing' | 'success'>('initial');

  const onlineAmount = totalAmount * 0.5;
  const cashAmount = totalAmount * 0.5;

  const handleStridePayment = async () => {
    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      // Simulate Stride payment processing
      // In production, this would integrate with actual Stride API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock payment ID
      const paymentId = `stride_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      setPaymentStep('success');
      onPaymentSuccess(paymentId);
    } catch (error) {
      onPaymentError('Payment processing failed. Please try again.');
      setPaymentStep('initial');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStep === 'success') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <Handshake className="h-5 w-5" />
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-green-700">
              <p>✅ 50% online payment completed</p>
              <p>💰 50% cash payment due on arrival</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Online Payment: {currency} {onlineAmount.toFixed(2)}
            </Badge>
            <Badge variant="outline" className="border-green-300 text-green-700">
              Cash on Arrival: {currency} {cashAmount.toFixed(2)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Stride Payment Gateway
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Payment Breakdown */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Payment Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Amount:</span>
                <span className="font-medium">{currency} {totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Online Payment (50%):</span>
                <span className="font-medium text-blue-600">{currency} {onlineAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cash on Arrival (50%):</span>
                <span className="font-medium text-green-600">{currency} {cashAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="text-sm text-gray-600 space-y-2">
            <p>🔒 Secure online payment for 50% of your booking</p>
            <p>💳 Accepts all major credit cards and digital wallets</p>
            <p>💰 Remaining 50% to be paid in cash upon arrival</p>
          </div>

          {/* Payment Button */}
          <Button
            onClick={handleStridePayment}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing Payment...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pay {currency} {onlineAmount.toFixed(2)} Online
              </div>
            )}
          </Button>

          {/* Security Notice */}
          <div className="text-xs text-gray-500 text-center">
            🔒 Your payment information is encrypted and secure
          </div>
        </div>
      </CardContent>
    </Card>
  );
}









