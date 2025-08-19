export class Quantity {
  private readonly value: number;
  constructor(v: number) {
    if (!Number.isFinite(v) || v <= 0) throw new Error("Invalid quantity");
    this.value = Number(v.toFixed(3));
  }
  get amount() {
    return this.value;
  }
}
