const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let products = [
  { id: 1, name: "Notebook", price: 4.99, rating: 4.5 },
  { id: 2, name: "Desk Lamp", price: 24.5, rating: 4.2 },
  { id: 3, name: "Water Bottle", price: 12, rating: 4.8 }
];

let nextId = 4;

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.post("/api/products", (req, res) => {
  const body = req.body || {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const price = body.price;
  const rating = body.rating;

  if (
    !name ||
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price < 0 ||
    typeof rating !== "number" ||
    !Number.isFinite(rating) ||
    rating < 0 ||
    rating > 5
  ) {
    return res.status(400).json({
      message: "Enter a product name, a price of 0 or more, and a rating from 0 to 5."
    });
  }

  const product = { id: nextId++, name, price, rating };
  products.push(product);
  res.status(201).json(product);
});

app.listen(PORT, () => {
  console.log(`Product Catalog is running at http://localhost:${PORT}`);
});
