const net = require('net');
require('dotenv').config();
const { validatePackets } = require('./packetValidator');

class TcpClient {
    constructor() {
        this.receivedPackets = [];
        this.missedPackets = [];
    }

    async fetchPackets() {
        try {
            await this.fetchFromServer();

            if (this.missedPackets.length > 0) {
                await this.fetchMissingPackets();
            }

            const validationResult = validatePackets(this.receivedPackets);
            if (!validationResult.isValid) {
                throw new Error(`Invalid packets detected: ${validationResult.invalidPackets}`);
            }

            console.log('All packets are valid');
            return this.receivedPackets;
        } catch (error) {
            console.error('Error during fetch:', error.message);
            throw error;
        }
    }

    fetchFromServer() {
        return new Promise((resolve, reject) => {
            const client = net.createConnection({ port: process.env.CLIENT_PORT }, () => {
                console.log('Connected to the server');
                client.write(Buffer.from([1])); // Request packets
            });

            client.on('data', (data) => {
                this.handleData(data);
            });

            client.on('end', () => {
                console.log('Connection ended');
                resolve();
            });

            client.on('error', (err) => {
                console.error('Error during fetching packets:', err.message);
                reject(err);
            });
        });
    }

    handleData(data) {
        console.log('Received data from server');

        let offset = 0;
        while (offset + 17 <= data.length) {
            const symbol = data.toString('ascii', offset, offset + 4).trim();
            const buySellIndicator = data.toString('ascii', offset + 4, offset + 5).trim();
            const quantity = data.readInt32BE(offset + 5);
            const price = data.readInt32BE(offset + 9);
            const sequence = data.readInt32BE(offset + 13);

            if (sequence > this.receivedPackets.length + 1) {
                this.fillMissingPackets(sequence);
            }

            this.receivedPackets[sequence - 1] = { symbol, buySellIndicator, quantity, price, sequence };
            offset += 17; // Move to the next packet
        }
    }

    fillMissingPackets(sequence) {
        while (this.receivedPackets.length < sequence - 1) {
            this.receivedPackets.push({
                symbol: "",
                buySellIndicator: "",
                quantity: NaN,
                price: NaN,
                sequence: NaN
            });
            this.missedPackets.push(this.receivedPackets.length);
        }
    }

    fetchMissingPackets() {
        return new Promise((resolve, reject) => {
            const client = net.createConnection({ port: process.env.CLIENT_PORT }, () => {
                console.log('Connected to the server for missing packets');
            });

            const requestPacket = (sequence) => {
                client.write(Buffer.from([2, sequence]), (err) => {
                    if (err) {
                        console.error(`Error requesting packet ${sequence}:`, err.message);
                        reject(err);
                    } else {
                        console.log(`Requested missing packet ${sequence}`);
                    }
                });
            };

            client.on('data', (data) => {
                this.handleMissingData(data);
                if (this.missedPackets.length > 0) {
                    requestPacket(this.missedPackets.shift());
                } else {
                    console.log('All missing packets received');
                    client.end();
                }
            });

            client.on('end', () => {
                console.log('Missing packets connection ended');
                resolve();
            });

            client.on('error', (err) => {
                console.error('Error in missing packets connection:', err.message);
                reject(err);
            });

            if (this.missedPackets.length > 0) {
                requestPacket(this.missedPackets.shift());
            } else {
                console.log('No missing packets to request');
                resolve();
            }
        });
    }

    handleMissingData(data) {
        console.log('Received missing packet from server');

        const symbol = data.toString('ascii', 0, 4).trim();
        const buySellIndicator = data.toString('ascii', 4, 5).trim();
        const quantity = data.readInt32BE(5);
        const price = data.readInt32BE(9);
        const sequence = data.readInt32BE(13);

        // Update the received packet in the array
        this.receivedPackets[sequence - 1] = { symbol, buySellIndicator, quantity, price, sequence };
    }
}

module.exports = TcpClient;
