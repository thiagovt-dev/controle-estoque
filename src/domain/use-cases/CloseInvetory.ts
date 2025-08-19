export class CloseInventory {
  constructor(
    private repo: { close(input: { inventoryId: string; userId: string }): Promise<void> }
  ) {}
  async execute(input: { inventoryId: string; userId: string }) {
    return this.repo.close(input);
  }
}
