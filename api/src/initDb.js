import fs from "fs";
import path from "path";
import pool from "./db.js";

async function init() {
  const schemaPath = path.join(process.cwd(), "src", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");

  try {
    await pool.query(schema);
    console.log("Database initialized.");
  } catch (err) {
    console.error("DB init error:", err);
  } finally {
    pool.end();
  }
}

init();
