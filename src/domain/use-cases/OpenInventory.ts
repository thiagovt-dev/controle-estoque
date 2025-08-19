import { Inventory } from "../entities/Inventory";

export interface OpenInventoryInput {
  orgId: string;
  warehouseId: string;
  userId: string;
}

export interface InventoryRepository {
  open(input: OpenInventoryInput): Promise<Inventory>;
  listByOrg(orgId: string): Promise<Inventory[]>;
  getWithItems(id: string): Promise<{ inventory: Inventory; items: any[] }>;
  upsertItem(input: { inventoryId: string; productId: string; countedQty: number }): Promise<any>;
  close(input: { inventoryId: string; userId: string }): Promise<void>;
}

export class OpenInventory {
  constructor(private repo: InventoryRepository) {}
  async execute(input: OpenInventoryInput) {
    return this.repo.open(input);
  }
}
