const Razorpay = require('razorpay')

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET
    })

    const { amount, currency = 'INR' } = req.body

    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `order_${Date.now()}`
    })

    res.json({ order_id: order.id, amount: order.amount })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
