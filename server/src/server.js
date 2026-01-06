require("dotenv").config();
const dns = require("node:dns");

// FORCE IPv4: This prevents the ConnectTimeoutError
dns.setDefaultResultOrder("ipv4first");

const app = require("./app");
const connectDB = require("./config/db");

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);