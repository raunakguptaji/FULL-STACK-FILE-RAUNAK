
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

let products = [
    {
        id: 1,
        name: "Laptop",
        price: 55000,
        description: "High performance laptop"
    },
    {
        id: 2,
        name: "Mouse",
        price: 800,
        description: "Wireless mouse"
    }
];

// READ
app.get('/products', (req, res) => {
    res.json(products);
});

// CREATE
app.post('/products', (req, res) => {
    const product = {
        id: Date.now(),
        name: req.body.name,
        price: Number(req.body.price),
        description: req.body.description
    };

    products.push(product);
    res.json({ message: "Product added successfully" });
});

// UPDATE
app.put('/products/:id', (req, res) => {
    const id = Number(req.params.id);
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    product.name = req.body.name;
    product.price = Number(req.body.price);
    product.description = req.body.description;

    res.json({ message: "Product updated successfully" });
});

// DELETE
app.delete('/products/:id', (req, res) => {
    const id = Number(req.params.id);
    products = products.filter(p => p.id !== id);

    res.json({ message: "Product deleted successfully" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
