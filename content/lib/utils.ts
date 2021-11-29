export {}
declare global {
  export interface Number {
    toCurrencyString(): String
  }
}

Number.prototype.toCurrencyString = function () {
  return this.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
