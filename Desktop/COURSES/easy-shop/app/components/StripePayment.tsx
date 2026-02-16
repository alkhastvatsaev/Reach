
'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Initialize Stripe (use your publishable key here)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

function CheckoutForm({ amount, onSuccess }: { amount: number, onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/tracking/success`,
      },
      redirect: 'if_required'
    });

    if (error) {
      setErrorMessage(error.message || "Une erreur est survenue");
      setLoading(false);
    } else {
      // Payment successful
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <PaymentElement />
      {errorMessage && <div style={{ color: '#ff3b30', marginTop: '12px', fontSize: '14px' }}>{errorMessage}</div>}
      <button 
        disabled={loading || !stripe} 
        style={{
          width: '100%', background: '#007AFF',
          color: 'white', border: 'none', borderRadius: '16px', padding: '18px',
          fontSize: '17px', fontWeight: '700', transition: 'all 0.3s',
          marginTop: '24px', opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? 'Traitement...' : `Payer ${amount.toFixed(2)}€`}
      </button>
    </form>
  );
}

export default function StripePayment({ amount, onSuccess }: { amount: number, onSuccess: () => void }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // Fetch client secret from the server
    fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [amount]);

  if (!clientSecret) return <div style={{ textAlign: 'center', padding: '20px', color: '#86868b' }}>Initialisation du paiement sécurisé...</div>;

  return (
    <div style={{ background: 'white', borderRadius: '24px', padding: '20px' }}>
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
        <CheckoutForm amount={amount} onSuccess={onSuccess} />
      </Elements>
    </div>
  );
}
