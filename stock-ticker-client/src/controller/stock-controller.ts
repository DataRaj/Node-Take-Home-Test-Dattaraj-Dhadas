import { Request, Response } from 'express';
import { TcpClient } from '../services/tcp-client.js';
import { getTickers } from '../services/ticker-services.js';

export class StockController {
    private tcpClient: TcpClient;

    constructor() {
        this.tcpClient = new TcpClient();
    }

    // Method to connect and fetch tickers
    async fetchTickers(req: Request, res: Response) {
        try {
            await this.tcpClient.connect();
            const tickers = getTickers();
            res.json(tickers);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch tickers' });
        }
    }
}
