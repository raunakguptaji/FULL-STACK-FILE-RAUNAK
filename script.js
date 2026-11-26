
const form = document.getElementById("productForm");
const productList = document.getElementById("productList");

// Display Products
async function loadProducts() {
    const res = await fetch("/products");
    const products = await res.json();

    productList.innerHTML = "";

    products.forEach(product => {
        const div = document.createElement("div");
        div.className = "product";

        div.innerHTML = `
            <h3>${product.name}</h3>
            <p>Price: ₹${product.price}</p>
            <p>${product.description}</p>

            <button class="edit-btn" onclick="editProduct(${product.id})">
                Edit
            </button>

            <button class="delete-btn" onclick="deleteProduct(${product.id})">
                Delete
            </button>
        `;

        productList.appendChild(div);
    });
}

// Add Product
form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const product = {
        name: document.getElementById("name").value,
        price: document.getElementById("price").value,
        description: document.getElementById("description").value
    };

    await fetch("/products", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
    });

    form.reset();
    loadProducts();
});

// Delete Product
async function deleteProduct(id) {
    await fetch(`/products/${id}`, {
        method: "DELETE"
    });

    loadProducts();
}

// Update Product
async function editProduct(id) {
    const res = await fetch("/products");
    const products = await res.json();

    const product = products.find(p => p.id === id);

    const name = prompt("Enter Product Name:", product.name);
    if (name === null) return;

    const price = prompt("Enter Product Price:", product.price);
    if (price === null) return;

    const description = prompt("Enter Description:", product.description);
    if (description === null) return;

    await fetch(`/products/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            price: price,
            description: description
        })
    });

    loadProducts();
}

// Load Products on Page
loadProducts();
