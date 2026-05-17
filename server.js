const express = require("express");
require("dotenv").config();
const initDatabase = require("./backend/config/dbInit");
const publicRoutes = require("./backend/routes/publicRoutes");
const adminRoutes = require("./backend/routes/adminRoutes");

const app = express();
app.use(express.json());

app.use("/api", publicRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    await initDatabase();
    console.log(`System initialization complete. Listening on port ${PORT}`);
});
