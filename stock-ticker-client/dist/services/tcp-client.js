var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import net from 'net';
import { SERVER_HOST, SERVER_PORT } from '../config/config.js';
import { parseTickerData, checkMissingSequences, requestMissingPackets } from '../utils/data-handlers.js';
export class TcpClient {
    constructor() {
        this.buffer = '';
        this.packets = [];
        this.client = new net.Socket();
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
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
                this.client.on('close', () => __awaiter(this, void 0, void 0, function* () {
                    const missingSequences = checkMissingSequences(this.packets);
                    if (missingSequences.length > 0) {
                        yield requestMissingPackets(missingSequences, this);
                    }
                    resolve();
                }));
            });
        });
    }
    requestResendPacket(seqNumber) {
        const payload = Buffer.from([0x02, seqNumber]);
        this.client.write(payload);
    }
}
