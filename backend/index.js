require("dotenv").config();
const express = require("express");

const authRoutes = require("./routes/authRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");


const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4000;


app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});


app.use("/", authRoutes);
app.use("/suppliers", supplierRoutes);
app.use("/purchase-orders", purchaseOrderRoutes);
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});