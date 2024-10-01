import path from 'path';
import { StockController } from './controller/stock-controller.js';
import express from 'express';

const app = express();
const port = process.env.PORT || 4000;
const stockController = new StockController();
console.log("*****we are on the path ",path.dirname('.'))
app.get('/tickers', (req, res) => stockController.fetchTickers(req, res));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
