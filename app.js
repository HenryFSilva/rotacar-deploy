import express from "express";
import router from "./src/routes/routes.js";
import bodyParser from 'body-parser';
import cors from 'cors';
import 'dotenv/config';


const app = express();
const port = 5000;

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const { json, urlencoded } = bodyParser;

app.use(json());
app.use(urlencoded({ extended: false }));
app.use('/', router);



app.listen(port, () => {
    console.log(`Servidor respondendo na porta ${port}`);
});