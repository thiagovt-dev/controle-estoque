export interface Inventory {
  id: string;
  orgId: string;
  warehouseId: string;
  status: "open" | "closed";
  createdBy: string;
  createdAt: Date;
  closedAt?: Date | null;
}

export interface InventoryItem {
  id: string;
  inventoryId: string;
  productId: string;
  countedQty: number | null;
  systemQty: number | null;
  diffQty: number | null;
}
