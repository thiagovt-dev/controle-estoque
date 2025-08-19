import { getServerSupabase } from "../../infra/supabase/server";
import { Move } from "../../domain/entities/Move";
import { CreateMoveInput, MoveRepository } from "../../domain/use-cases/CreateMove";

export class SupabaseMoveRepository implements MoveRepository {
  async create(input: CreateMoveInput, userId: string): Promise<Move> {
    const supabase = await getServerSupabase();
    const payload: any = {
      org_id: input.orgId,
      type: input.type,
      product_id: input.productId,
      warehouse_from_id: input.warehouseFromId ?? null,
      warehouse_to_id: input.warehouseToId ?? null,
      qty: input.qty,
      reason: input.reason ?? null,
      ref_id: input.refId ?? null,
      created_by: userId,
    };
    const { data, error } = await supabase.from("stock_moves").insert(payload).select("*").single();
    if (error) throw error;
    return {
      id: data.id,
      orgId: data.org_id,
      type: data.type,
      productId: data.product_id,
      warehouseFromId: data.warehouse_from_id,
      warehouseToId: data.warehouse_to_id,
      qty: Number(data.qty),
      reason: data.reason,
      refId: data.ref_id,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
    };
  }
}
