import { Ticker } from '../models/ticker-types.js';

export function parseTickerData(buffer: Buffer): Ticker[] {
    const packets: Ticker[] = [];
    const packetSize = 17;

    for (let i = 0; i < buffer.length; i += packetSize) {
        const symbol = buffer.slice(i, i + 4).toString();
        const buySell = buffer.slice(i + 4, i + 5).toString();
        const quantity = buffer.readInt32BE(i + 5);
        const price = buffer.readInt32BE(i + 9);
        const sequence = buffer.readInt32BE(i + 13);

        packets.push({ symbol, buySell, quantity, price, sequence });
    }

    return packets;
}

export function checkMissingSequences(packets: Ticker[]): number[] {
    const missing: number[] = [];
    let expectedSeq = packets[0]?.sequence || 0;

    for (const packet of packets) {
        while (expectedSeq < packet.sequence) {
            missing.push(expectedSeq);
            expectedSeq++;
        }
        expectedSeq++;
    }

    return missing;
}

export async function requestMissingPackets(missingSequences: number[], client: any) {
    for (const seq of missingSequences) {
        client.requestResendPacket(seq);
    }
}
