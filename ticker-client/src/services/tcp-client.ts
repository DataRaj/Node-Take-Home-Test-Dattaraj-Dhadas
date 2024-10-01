import net from 'net';
import { SERVER_HOST, SERVER_PORT } from '../config/config.js';
import { parseTickerData, checkMissingSequences, requestMissingPackets } from '../utils/data-handlers.js';

export class TcpClient {
    private client: net.Socket;
    private buffer: string = '';
    private packets: any[] = [];

    constructor() {
        this.client = new net.Socket();
    }

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.connect(SERVER_PORT, SERVER_HOST, () => {
                console.log(`Connected to server at ${SERVER_HOST}:${SERVER_PORT}`);
                this.client.write(Buffer.from([0x01]));
            });

            this.client.on('data', (data) => {
                this.buffer += data.toString('hex');
                const packets = parseTickerData(Buffer.from(this.buffer, 'hex'));
                this.packets.push(...packets);
                this.buffer = '';
            });

            this.client.on('error', (err) => {
                reject(`Connection error: ${err.message}`);
            });

            this.client.on('close', async () => {
                const missingSequences = checkMissingSequences(this.packets);
                if (missingSequences.length > 0) {
                    await requestMissingPackets(missingSequences, this);
                }
                resolve();
            });
        });
    }

    requestResendPacket(seqNumber: number) {
        const payload = Buffer.from([0x02, seqNumber]);
        this.client.write(payload);
    }
}
