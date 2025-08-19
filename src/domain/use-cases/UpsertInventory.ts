export class UpsertInventoryItem {
  constructor(
    private repo: {
      upsertItem(input: {
        inventoryId: string;
        productId: string;
        countedQty: number;
      }): Promise<any>;
    }
  ) {}
  async execute(input: { inventoryId: string; productId: string; countedQty: number }) {
    return this.repo.upsertItem(input);
  }
}
