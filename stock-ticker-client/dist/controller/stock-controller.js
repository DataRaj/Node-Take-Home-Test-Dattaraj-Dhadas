var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TcpClient } from '../services/tcp-client.js';
import { getTickers } from '../services/ticker-services.js';
export class StockController {
    constructor() {
        this.tcpClient = new TcpClient();
    }
    // Method to connect and fetch tickers
    fetchTickers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.tcpClient.connect();
                const tickers = getTickers();
                res.json(tickers);
            }
            catch (error) {
                res.status(500).json({ error: 'Failed to fetch tickers' });
            }
        });
    }
}
