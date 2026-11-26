require("dotenv").config();

const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const { notFound, errorMiddleware } = require("./middleware/errorMiddleware");

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", database: "connected" });
});

app.use("/api/products", productRoutes);
app.use(notFound);
app.use(errorMiddleware);

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Product Management is running at http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error(`Server could not start: ${error.message}`);
  process.exit(1);
});
