// models/Packet.js
class Packet {
      constructor(symbol, buySellIndicator, quantity, price, sequence) {
          this.symbol = symbol;
          this.buySellIndicator = buySellIndicator;
          this.quantity = quantity;
          this.price = price;
          this.sequence = sequence;
      }
  
      static createDummy() {
          return new Packet("", "", NaN, NaN, NaN);
      }
  
      isValid() {
          return (
              this.symbol &&
              this.buySellIndicator &&
              !isNaN(this.quantity) &&
              !isNaN(this.price) &&
              !isNaN(this.sequence)
          );
      }
  }

      module.exports = Packet;