# ShopEase

ShopEase is a responsive e-commerce application with a React/Vite storefront and an Express/Mongoose API. Prices are displayed in INR. The frontend can use sample data in demo mode; the backend starts only after it connects to MongoDB Atlas.

## Features

- Product catalog with search, category, price, and sort filters
- Product details, related products, and stock-aware cart stored in localStorage
- Checkout form, demo COD orders, and MongoDB-backed verified Razorpay order history
- MongoDB-backed customer accounts, products, and orders; browser-only demo accounts remain available for frontend testing
- Protected seller/admin dashboard with MongoDB product and order management
- Express REST API, Mongoose models, JWT/bcrypt authentication
- Razorpay Standard Checkout with server-calculated amounts, payment capture and signature verification
- Responsive layout, empty/loading/error states, and toast messages

## Technologies

React, Vite, JavaScript, CSS, Express, MongoDB, Mongoose, Axios, React Router, Lucide, JWT, bcrypt, Razorpay.

## Folder structure

```text
12SHOPPING/
  frontend/
    src/
      components/ context/ data/ layouts/ pages/ services/ utils/
  backend/
    config/ controllers/ data/ middleware/ models/ routes/ scripts/ test/
```

## Install and run

Install Node.js 20 or newer and configure `backend/.env` as described below. From this folder:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The Express API runs on `http://localhost:5000` after MongoDB connects. You can start the frontend and backend separately with `npm run dev:frontend` and `npm run dev:backend`; the backend will not listen if Atlas is unavailable or its URI is incomplete.

To run the frontend-only demo without Atlas, use `npm run dev:frontend`. Demo accounts and demo product/order changes are browser-local and do not write to MongoDB.

### Demo accounts

- Customer: `customer@shopease.demo` / `customer123`
- Seller: `seller@shopease.demo` / `seller123`

These are frontend-only demo accounts. Register a separate account while MongoDB is connected to create a persistent customer record and real JWT. New accounts are customers; assign `seller` or `admin` to a trusted account in Atlas before using database-backed seller tools.

## Connect MongoDB Atlas

1. In Atlas, create a database user with read/write access to the ShopEase database and allow your development IP under Network Access.
2. Keep the existing `backend/.env` file. For a fresh checkout only, copy `backend/.env.example` to `backend/.env`.
3. Set `MONGODB_URI` in `backend/.env` to your Atlas connection string and replace the `<db_password>` placeholder locally. URL-encode special characters in the password. Also replace the example `JWT_SECRET` with a long random value.
4. Start the app with `npm run dev`. The backend connects to Atlas before opening port 5000; it prints a safe error and does not start listening if the connection fails.

If Node reports `ECONNREFUSED` while resolving the Atlas SRV record on Windows, set the optional `MONGODB_DNS_SERVERS` in `backend/.env` to a DNS server configured for your network. This setting affects only the backend process.

Check `http://localhost:5000/api/health`. Once the API starts, it returns HTTP 200 and JSON with `"database": {"connected": true}`. If Atlas disconnects later, the health endpoint returns HTTP 503; if Atlas is unavailable at startup, the API logs an error and does not open its port. The URI and credentials are never sent to the frontend.

If the database has no products, seed the sample catalog once:

```powershell
npm run seed:products --workspace backend
```

The seed command skips the insert when the products collection is already populated. Product create, update, delete, and order APIs write to MongoDB.

## Test Razorpay payments

The Razorpay SDK is already included in the backend dependencies. Online payments require MongoDB, a real account registered through the app, and Razorpay test keys. Demo accounts and browser-only demo orders cannot make online payments.

1. Complete the Atlas setup above. In `backend/.env`, set a long random `JWT_SECRET` and Razorpay **Test Mode** credentials:

   ```dotenv
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
   JWT_SECRET=replace-with-a-long-random-secret
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=your-test-key-secret
   ```

   Keep `RAZORPAY_KEY_SECRET` only in `backend/.env`. Do not add it to frontend variables or commit `.env`.

3. If this MongoDB database has no products yet, seed the sample catalog. The command does not overwrite an existing catalog:

   ```powershell
   npm run seed:products --workspace backend
   ```

4. Start ShopEase from the project root:

   ```powershell
   npm run dev
   ```

5. Open `http://localhost:5173`, register a customer account, add products to the cart, and select **Razorpay → Pay Now**. Razorpay Standard Checkout displays the payment methods enabled for your test account, including UPI, cards, and net banking when available.

6. Use the test payment details provided in Razorpay's official [Test Mode documentation](https://razorpay.com/docs/payments/payments/test-card-upi-details/). A successful payment is captured and verified by the backend before the order is marked **Paid**. Check the order success page and **My orders**.

The checkout amount is recalculated from product prices in MongoDB. The backend creates the Razorpay order, verifies its HMAC signature, confirms the amount/currency/order with Razorpay, captures an authorized payment if needed, and only then updates the MongoDB order to `paid`. Repeated checkout requests reuse an idempotency key; repeated verification cannot create a second paid order.

If MongoDB is unavailable, the backend does not start and payment is unavailable. You can still run the frontend-only demo with `npm run dev:frontend`; demo accounts and local cart/order data do not create database records. Razorpay keys alone are not sufficient: the product catalog, authenticated customer, pending order, and verified payment status are persisted in MongoDB.

## Configure Razorpay credentials

Add your test keys to `backend/.env` as `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. Keep the secret only on the backend. The payment UI and API remain disabled without both keys. A payment is marked paid only after the backend verifies the Razorpay signature.

## API overview

- `GET /api/products`, `GET /api/products/:id`
- `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id` (seller/admin JWT)
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/profile`
- `POST /api/orders`, `GET /api/orders/my-orders`, `GET /api/orders`, `GET /api/orders/:id`, `PUT /api/orders/:id/status`
- `GET /api/payments/config`, `POST /api/payments/create-order`, `POST /api/payments/verify`

Set `PORT`, `CLIENT_URL`, `MONGODB_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET` in `backend/.env` as needed.
