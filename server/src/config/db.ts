import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? {rejectUnauthorized: false, } : false,
});

pool.on("connect", () => {
    console.log("Connection has been established with PostgreSQL database.")
})

export default pool;