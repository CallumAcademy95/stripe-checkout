const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');
const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET);

app.use(cors());
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1RJDOURWXauqiT6MXOjQFlKm', // 💰 Deposit (one-time)
          quantity: 1
        },
        {
          price: 'price_1QgYOoRWXauqiT6MXpHVdpZm', // 🔁 Monthly recurring
          quantity: 1
        }
      ],
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          cancel_after_months: '5'
        }
      },
      success_url: 'https://yourdomain.com/success',
      cancel_url: 'https://yourdomain.com/cancel'
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(4242, () => console.log('✅ Server running on http://localhost:4242'));
