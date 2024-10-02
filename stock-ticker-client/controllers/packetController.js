const net = require('net');
const fs = require('fs').promises;
const path = require('path');
const PacketCollection = require('../models/packetCollections');
const Packet = require('../models/packets');

class PacketController {
    constructor() {
        this.packetCollection = new PacketCollection();
        this.port = process.env.CLIENT_PORT || 3000;
        this.outputDir = process.env.OUTPUT_DIR || path.join(__dirname, '..', 'output');
    }

    async fetchAllPackets() {
        try {
            await this._fetchInitialPackets();
            if (this.packetCollection.missedSequences.length > 0) {
                await this._fetchMissingPackets();
            }
            const packets = this._validateAndReturnPackets();
            await this._savePacketsToFile(packets);
            return packets;
        } catch (error) {
            console.error('Error during fetch:', error);
            throw error;
        }
    }

    async _savePacketsToFile(packets) {
        try {
            await fs.mkdir(this.outputDir, { recursive: true });
            const filename = `packets_${new Date().toISOString().replace(/:/g, '-')}.json`;
            const filepath = path.join(this.outputDir, filename);
            await fs.writeFile(filepath, JSON.stringify(packets, null, 2));
            console.log(`Packets saved to ${filepath}`);
        } catch (error) {
            console.error('Error saving packets to file:', error);
        }
    }

    _fetchInitialPackets() {
        return new Promise((resolve, reject) => {
            const client = this._createConnection(resolve, reject);
            client.on('ready', () => this._requestPackets(client));
            client.on('data', (data) => this._processReceivedData(data));
        });
    }

    _fetchMissingPackets() {
        return new Promise((resolve, reject) => {
            const client = this._createConnection(resolve, reject);
            client.on('ready', () => this._requestMissingPacket(client));
            client.on('data', (data) => this._processMissingPacket(data, client));
        });
    }

    _createConnection(resolve, reject) {
        const client = net.createConnection({ port: this.port }, () => {
            console.log('Connected to server on port', this.port);
        });
        client.on('error', (err) => {
            console.error('Client error:', err);
            reject(err);
        });
        client.on('close', () => {
            console.log('Connection closed');
            resolve();
        });
        return client;
    }

    _requestPackets(client) {
        console.log('Requesting packets');
        client.write(Buffer.from([1]), (err) => {
            if (err) {
                console.error('Error requesting packets:', err);
                client.destroy();
            } else {
                client.end();
            }
        });
    }

    _processReceivedData(data) {
        let offset = 0;
        while (offset + 17 <= data.length) {
            const packet = this._parsePacket(data, offset);
            this.packetCollection.addPacket(packet);
            offset += 17;
        }
    }

    _requestMissingPacket(client) {
        if (this.packetCollection.missedSequences.length > 0) {
            const sequence = this.packetCollection.missedSequences[0];
            client.write(Buffer.from([2, sequence]), (err) => {
                if (err) {
                    console.error('Error requesting missing packet:', err);
                    client.destroy();
                }
            });
        } else {
            client.end();
        }
    }

    _processMissingPacket(data, client) {
        const packet = this._parsePacket(data, 0);
        this.packetCollection.updatePacket(packet);
        this._requestMissingPacket(client);
    }

    _parsePacket(data, offset) {
        return new Packet(
            data.toString('ascii', offset, offset + 4),
            data.toString('ascii', offset + 4, offset + 5),
            data.readInt32BE(offset + 5),
            data.readInt32BE(offset + 9),
            data.readInt32BE(offset + 13)
        );
    }

    _validateAndReturnPackets() {
        const validationResult = this.packetCollection.validate();
        if (!validationResult.isValid) {
            throw new Error(`Invalid packets detected: ${validationResult.invalidPackets.join(', ')}`);
        }
        console.log('All packets are valid');
        return this.packetCollection.packets;
    }
}

module.exports = PacketController;
