const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const app = express();

// Initialize Stripe with your secret key from environment variables
const stripe = Stripe(process.env.STRIPE_SECRET);

app.use(cors());
app.use(express.json());

const path = require('path');

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Serve client.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'client.html'));
});

app.post('/create-checkout-session', async (req, res) => {
  try {
    // NEW: read partner_id from POST body, sanitise to a safe slug
    const partner_id = String(req.body?.partner_id || 'direct')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '')
      .slice(0, 64) || 'direct';

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
      // NEW: tag the checkout session itself
      client_reference_id: partner_id,
      metadata: { partner_id },
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          cancel_after_months: 5,
          partner_id, // NEW: stamps every future invoice with the gym
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
