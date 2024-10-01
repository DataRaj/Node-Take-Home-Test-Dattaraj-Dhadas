import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Get __filename and __dirname for ES Modules
// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tickerFile = path.join(__dirname, '../data/tickers.json');
export const getTickers = () => {
    try {
        const data = fs.readFileSync(tickerFile, 'utf-8');
        return JSON.parse(data);
    }
    catch (err) {
        console.error('Error reading ticker data', err);
        return [];
    }
};
