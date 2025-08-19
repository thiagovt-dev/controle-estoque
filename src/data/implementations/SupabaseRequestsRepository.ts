import { getServerSupabase } from "../../infra/supabase/server";
import { Request } from "../../domain/entities/Request";
import { OpenRequestInput, RequestsRepository } from "../../domain/use-cases/OpenRequest";

export class SupabaseRequestsRepository implements RequestsRepository {
  async open(input: OpenRequestInput): Promise<Request> {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase
      .from("requests")
      .insert({
        org_id: input.orgId,
        department_id: input.departmentId,
        warehouse_id: input.warehouseId,
        status: "pending",
        created_by: input.userId,
      })
      .select("*")
      .single();
    if (error) throw error;
    return {
      id: data.id,
      orgId: data.org_id,
      departmentId: data.department_id,
      warehouseId: data.warehouse_id,
      status: data.status,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      approvedBy: data.approved_by,
      approvedAt: data.approved_at ? new Date(data.approved_at) : null,
      rejectedBy: data.rejected_by,
      rejectedAt: data.rejected_at ? new Date(data.rejected_at) : null,
      rejectionReason: data.rejection_reason,
    };
  }

  async addItem(input: { requestId: string; productId: string; qty: number }): Promise<void> {
    const supabase =await getServerSupabase();
    const { error } = await supabase.from("request_items").insert({
      request_id: input.requestId,
      product_id: input.productId,
      qty: input.qty,
    });
    if (error) throw error;
  }

  async approve(input: { requestId: string; userId: string }): Promise<void> {
    const supabase = await getServerSupabase();
    const { error } = await supabase.rpc("request_approve", {
      p_request_id: input.requestId,
      p_user_id: input.userId,
    });
    if (error) throw error;
  }

  async reject(input: { requestId: string; userId: string; reason: string }): Promise<void> {
    const supabase = await getServerSupabase();
    const { error } = await supabase.rpc("request_reject", {
      p_request_id: input.requestId,
      p_user_id: input.userId,
      p_reason: input.reason,
    });
    if (error) throw error;
  }

  async getWithItems(
    id: string
  ): Promise<{
    request: Request;
    items: Array<{ id: string; productId: string; productName: string; sku: string; qty: number }>;
  }> {
    const supabase = await getServerSupabase();
    const reqRes = await supabase.from("requests").select("*").eq("id", id).single();
    if (reqRes.error || !reqRes.data) throw reqRes.error || new Error("Request not found");
    const itemsRes = await supabase
      .from("request_items")
      .select("id,product_id,qty,product:products!request_items_product_id_fkey(name,sku)")
      .eq("request_id", id)
      .order("product_id");
    if (itemsRes.error) throw itemsRes.error;
    return {
      request: {
        id: reqRes.data.id,
        orgId: reqRes.data.org_id,
        departmentId: reqRes.data.department_id,
        warehouseId: reqRes.data.warehouse_id,
        status: reqRes.data.status,
        createdBy: reqRes.data.created_by,
        createdAt: new Date(reqRes.data.created_at),
        approvedBy: reqRes.data.approved_by,
        approvedAt: reqRes.data.approved_at ? new Date(reqRes.data.approved_at) : null,
        rejectedBy: reqRes.data.rejected_by,
        rejectedAt: reqRes.data.rejected_at ? new Date(reqRes.data.rejected_at) : null,
        rejectionReason: reqRes.data.rejection_reason,
      },
      items: (itemsRes.data ?? []).map((r) => ({
        id: r.id,
        productId: r.product_id,
        productName: r.product?.[0]?.name ?? "",
        sku: r.product?.[0]?.sku ?? "",
        qty: Number(r.qty),
      })),
    };
  }

  async listByOrg(orgId: string): Promise<Request[]> {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return (data ?? []).map((d) => ({
      id: d.id,
      orgId: d.org_id,
      departmentId: d.department_id,
      warehouseId: d.warehouse_id,
      status: d.status,
      createdBy: d.created_by,
      createdAt: new Date(d.created_at),
      approvedBy: d.approved_by,
      approvedAt: d.approved_at ? new Date(d.approved_at) : null,
      rejectedBy: d.rejected_by,
      rejectedAt: d.rejected_at ? new Date(d.rejected_at) : null,
      rejectionReason: d.rejection_reason,
    }));
  }
}
