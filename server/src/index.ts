import express from "express";
import cors from "cors";
import animeRoutes from "./routes/animeRoutes.ts"
import guessRoutes from "./routes/guessRoutes.ts";
import sessionRoutes from "./routes/sessionRoutes.ts";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/", animeRoutes);
app.use("/guess", guessRoutes)
app.use("/session", sessionRoutes)

app.listen(port, () => {
    console.log(`Server running on localhost http://localhost:${port}/`)
});

