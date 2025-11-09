import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello testing testing")
});

app.listen(port, () => {
    console.log(`Server running on localhost http://localhost:${port}/`)
});

