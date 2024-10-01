import fs from 'fs';
import path from 'path';

const tickers = [
    { symbol: 'AAPL', price: 150.25 },
    { symbol: 'GOOGL', price: 2800.15 },
    { symbol: 'AMZN', price: 3450.45 },
];

const tickerFile = path.join(__dirname, '../data/tickers.json');

fs.writeFile(tickerFile, JSON.stringify(tickers, null, 2), (err) => {
    if (err) {
        console.error('Error writing to JSON file', err);
    } else {
        console.log('Dummy ticker data generated');
    }
});
