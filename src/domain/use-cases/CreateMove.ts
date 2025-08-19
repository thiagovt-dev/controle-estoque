import { Move } from "../entities/Move";

export interface CreateMoveInput {
  orgId: string;
  type: "IN" | "OUT" | "TRANSFER";
  productId: string;
  warehouseFromId?: string | null;
  warehouseToId?: string | null;
  qty: number;
  reason?: string | null;
  refId?: string | null;
}

export interface MoveRepository {
  create(data: CreateMoveInput, userId: string): Promise<Move>;
}

export class CreateMove {
  constructor(private repo: MoveRepository) {}
  async execute(input: CreateMoveInput, userId: string) {
    if (input.type === "IN" && !input.warehouseToId) throw new Error("warehouseToId required");
    if (input.type === "OUT" && !input.warehouseFromId) throw new Error("warehouseFromId required");
    if (input.type === "TRANSFER" && (!input.warehouseFromId || !input.warehouseToId))
      throw new Error("Both warehouses required");
    return this.repo.create(input, userId);
  }
}
