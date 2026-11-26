# Express RESTful CRUD with MongoDB – Product Management System

A beginner-friendly Express API and small browser interface for creating, viewing, editing, and deleting products. Product records are stored in MongoDB through Mongoose.

## Product fields

- `name`: product name
- `price`: price in rupees (zero or more)
- `category`: product category
- `quantity`: whole-number stock count (zero or more)
- `description`: short product description

MongoDB adds `_id`, `createdAt`, and `updatedAt` automatically.

## Project structure

```text
11CRUD/
  config/db.js
  controllers/productController.js
  middleware/errorMiddleware.js
  models/Product.js
  public/
    app.js
    index.html
    styles.css
  routes/productRoutes.js
  test/productModel.test.js
  .env
  .env.example
  .gitignore
  package.json
  server.js
```

## Setup

Install Node.js 20 or newer. Open a terminal in this `11CRUD` folder and install dependencies:

```powershell
npm install
```

### Connect MongoDB Atlas

1. In MongoDB Atlas, create a database user under **Security → Database Access** and grant it `readWrite` access to the `product_management` database.
2. Under **Security → Network Access**, allow your current public IP address.
3. Open `.env` in this folder and set `MONGODB_URI` to the connection string from Atlas. Replace the sample username, password, and cluster host with your own values. URL-encode special characters in the password. Do not send or commit the URI.
4. Save `.env`. The `.gitignore` file prevents it from being committed.
5. Start the server:

```powershell
npm run dev
```

Open `http://localhost:3001`. The server waits for MongoDB before listening. If the URI is empty, the credentials are rejected, or Atlas cannot be reached, the terminal shows an error and the API does not start.

If Node reports `ECONNREFUSED` when resolving Atlas SRV records on Windows, set the optional `MONGODB_DNS_SERVERS` in `.env` to a DNS server configured for your network.

For a normal production-style start, use:

```powershell
npm start
```

## REST API

All responses are JSON. The collection is `products`.

| Method | URL | Purpose |
|---|---|---|
| `GET` | `/api/products` | Get every product |
| `GET` | `/api/products/:id` | Get one product by MongoDB ID |
| `POST` | `/api/products` | Create a product |
| `PUT` | `/api/products/:id` | Replace a product's editable fields |
| `DELETE` | `/api/products/:id` | Delete a product |
| `GET` | `/api/health` | Check the running API |

### JSON body for POST and PUT

```json
{
  "name": "Canvas Backpack",
  "price": 1499.5,
  "category": "Accessories",
  "quantity": 12,
  "description": "A durable backpack for everyday use."
}
```

The five fields are required. Price must be non-negative, and quantity must be a non-negative whole number. A malformed MongoDB ID returns `400`; a valid ID with no matching product returns `404`.

## Test with Postman

With the server running, create a request for each route:

1. **Create:** `POST http://localhost:3001/api/products`, choose **Body → raw → JSON**, paste the example JSON, and send. Expect `201 Created`.
2. **List:** `GET http://localhost:3001/api/products`. Copy a product's `_id` from the response.
3. **Read one:** `GET http://localhost:3001/api/products/PRODUCT_ID`, replacing `PRODUCT_ID` with the copied `_id`.
4. **Update:** `PUT http://localhost:3001/api/products/PRODUCT_ID`, send the JSON body with one or more changed values. All five fields are required for an update.
5. **Delete:** `DELETE http://localhost:3001/api/products/PRODUCT_ID`.

For both POST and PUT, Postman should send `Content-Type: application/json`. The included browser interface performs these same API requests.

## Tests

Run the model validation tests:

```powershell
npm test
```
