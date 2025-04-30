const express = require('express');
const Stripe = require('stripe');
const app = express();

// ✅ Your live secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET);

// ⛔ Replace with your actual live webhook secret from Stripe dashboard
const endpointSecret = process.env.WEBHOOK_SECRET;

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], endpointSecret);
    console.log(`✅ Received event type: ${event.type}`);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed.', err.message);
    return res.sendStatus(400);
  }

  if (event.type === 'customer.subscription.created') {
    const subscription = event.data.object;

    if (subscription.metadata.cancel_after_months === '5') {
      const cancelTime = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 * 5;

      await stripe.subscriptions.update(subscription.id, {
        cancel_at: cancelTime,
      });

      console.log(`✅ Scheduled cancellation for subscription ${subscription.id} at ${new Date(cancelTime * 1000)}`);
    } else {
      console.log(`ℹ️ Subscription ${subscription.id} created without cancel metadata.`);
    }
  }

  res.sendStatus(200);
});

app.listen(4243, () => console.log('🔔 Webhook server running on http://localhost:4243'));
