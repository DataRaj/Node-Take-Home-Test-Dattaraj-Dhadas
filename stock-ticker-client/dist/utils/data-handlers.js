var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function parseTickerData(buffer) {
    const packets = [];
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
export function checkMissingSequences(packets) {
    var _a;
    const missing = [];
    let expectedSeq = ((_a = packets[0]) === null || _a === void 0 ? void 0 : _a.sequence) || 0;
    for (const packet of packets) {
        while (expectedSeq < packet.sequence) {
            missing.push(expectedSeq);
            expectedSeq++;
        }
        expectedSeq++;
    }
    return missing;
}
export function requestMissingPackets(missingSequences, client) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const seq of missingSequences) {
            client.requestResendPacket(seq);
        }
    });
}
