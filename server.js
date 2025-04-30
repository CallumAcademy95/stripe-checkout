const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const path = require('path');
const app = express();

// Initialize Stripe with your secret key from environment variables
const stripe = Stripe(process.env.STRIPE_SECRET);

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve 'client.html' at the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'client.html'));
});

app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1RJDOURWXauqiT6MXOjQFlKm', // Deposit
          quantity: 1,
        },
        {
          price: 'price_1QgYOoRWXauqiT6MXpHVdpZm', // Monthly
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          cancel_after_months: 5,
        },
      },
      success_url: 'https://stripe-checkout-1j4i.onrender.com/success',
      cancel_url: 'https://stripe-checkout-1j4i.onrender.com/cancel',
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(4242, () => console.log('✅ Server running on http://localhost:4242'));
