const Packet = require("./packets");

class PacketCollection {
      constructor() {
          this.packets = [];
          this.missedSequences = [];
      }
  
      addPacket(packet) {
          if (packet.sequence > this.packets.length) {
              while (this.packets.length + 1 < packet.sequence) {
                  this.packets.push(Packet.createDummy());
                  this.missedSequences.push(this.packets.length);
              }
              this.packets.push(packet);
          }
      }
  
      updatePacket(packet) {
          this.packets[packet.sequence - 1] = packet;
          this.missedSequences = this.missedSequences.filter(seq => seq !== packet.sequence - 1);
      }
  
      validate() {
          const invalidPackets = [];
          for (let i = 0; i < this.packets.length; i++) {
              if (!this.packets[i].isValid() || this.packets[i].sequence !== i + 1) {
                  invalidPackets.push(i + 1);
              }
          }
          return { isValid: invalidPackets.length === 0, invalidPackets };
      }
  }
  
    module.exports = PacketCollection;