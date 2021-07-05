const express = require("express");
const app = express();
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('clients/build'));
}

app.post("/payment", cors(), async (req, res) => {
  const { products, email } = await req.body;
  const transformedItems = await products.map(item => ({
    description: item.description,
    quantity: item.quantity,
    price_data: {
      currency: 'usd',
      unit_amount: item.price * 100,
      product_data: {
        name: item.title,
        images: [item.image]
      }
    }
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    shipping_rates: ['shr_1J856fF4TDOSFmXiDsw3yFtN'],
    shipping_address_collection: {
      allowed_countries: ['GB', 'US', 'CA']
    },
    line_items: transformedItems,
    mode: 'payment',
    success_url: '/success_payment',
    cancel_url: '/fail_payment',
    metadata: {
      email,
      images: JSON.stringify(products.map(item => item.image))
    }
  });

  res.json({ id: session.id })
});

app.use(cors());

// app.use(cors({
//   origin:'http://localhost:3000', 
//   credentials:true,
//   optionSuccessStatus:200
// }));

app.listen(process.env.PORT || 4000, () => console.log("Server Start"));

