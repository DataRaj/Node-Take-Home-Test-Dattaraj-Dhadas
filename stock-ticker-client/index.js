const PacketController = require('./controllers/packetController');

async function main() {
    const controller = new PacketController();
    try {
        const packets = await controller.fetchAllPackets();
        console.log('Fetched packets:', packets);
    } catch (error) {
        console.error('Error in main:', error);
    }
}

main();