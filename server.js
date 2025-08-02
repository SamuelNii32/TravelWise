import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import indexRoutes from "./routes/index.js"; // ✅ Step 1: Import your routes

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Required for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Set Pug as view engine
app.set("view engine", "pug");

// 2. Set views directory
app.set("views", path.join(__dirname, "views"));

// 3. Serve static files
app.use(express.static(path.join(__dirname, "public")));

// 4. Middleware for parsing form + JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 5. Use routes
app.use("/", indexRoutes); // ✅ Step 2: Use the route

// 6. Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
