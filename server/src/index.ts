import express from "express";
import cors from "cors";
import helmet from "helmet";
import animeRoutes from "./routes/animeRoutes.ts"

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/", animeRoutes);

app.listen(port, () => {
    console.log(`Server running on localhost http://localhost:${port}/`)
});

