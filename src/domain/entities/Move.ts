export type MoveType = "IN" | "OUT" | "TRANSFER";

export interface Move {
  id: string;
  orgId: string;
  type: MoveType;
  productId: string;
  warehouseFromId?: string | null;
  warehouseToId?: string | null;
  qty: number;
  reason?: string | null;
  refId?: string | null;
  createdBy: string;
  createdAt: Date;
}
