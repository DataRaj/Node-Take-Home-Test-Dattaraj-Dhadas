const validatePackets = (packets) => {
    let isValid = true;
    const invalidPackets = [];

    packets.forEach((packet, index) => {
        if (!packet.symbol || !packet.buySellIndicator || isNaN(packet.quantity) || isNaN(packet.price) || isNaN(packet.sequence)) {
            isValid = false;
            invalidPackets.push(index + 1);  // Log the sequence number of the invalid packet
        }

        if (packet.sequence !== index + 1) {
            isValid = false;
            invalidPackets.push(index + 1);
        }
    });

    return { isValid, invalidPackets };
};

module.exports = { validatePackets };
