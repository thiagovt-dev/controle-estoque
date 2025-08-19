"use server";

import { revalidateTag } from "next/cache";
import { getServerSupabase } from "../infra/supabase/server";
import { TAGS } from "../lib/cacheTags";
import {
  requestOpenSchema,
  requestItemSchema,
  requestApproveSchema,
  requestRejectSchema,
} from "../lib/zodSchemas";
import { SupabaseRequestsRepository } from "../data/implementations/SupabaseRequestsRepository";
import { OpenRequest } from "../domain/use-cases/OpenRequest";
import { AddRequestItem } from "../domain/use-cases/AddRequestItem";
import { ApproveRequest } from "../domain/use-cases/ApproveRequest";
import { RejectRequest } from "../domain/use-cases/RejectRequest";
import { requireRole } from "../infra/auth/requireRole";
import { ServerActionError, withErrorHandling } from "@/actions/errorAction";

export async function openRequest(formData: FormData) {
  return withErrorHandling(async () => {
    const supabase = await getServerSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) throw new ServerActionError("Unauthorized", 401);
    const parsed = requestOpenSchema.parse({
      orgId: String(formData.get("orgId") || ""),
      departmentId: String(formData.get("departmentId") || ""),
      warehouseId: String(formData.get("warehouseId") || ""),
    });
    await requireRole(["admin", "operator"], parsed.orgId);
    const repo = new SupabaseRequestsRepository();
    const uc = new OpenRequest(repo);
    const req = await uc.execute({ ...parsed, userId: auth.user.id });
    revalidateTag(TAGS.requestsList);
    revalidateTag(TAGS.request(req.id));
    return null as unknown as void;
  });
}

export async function addRequestItem(formData: FormData) {
  return withErrorHandling(async () => {
    const parsed = requestItemSchema.parse({
      requestId: String(formData.get("requestId") || ""),
      productId: String(formData.get("productId") || ""),
      qty: Number(formData.get("qty") || 0),
    });
    const repo = new SupabaseRequestsRepository();
    const { request } = await repo.getWithItems(parsed.requestId);
    await requireRole(["admin", "operator"], request.orgId);
    const uc = new AddRequestItem(repo);
    await uc.execute(parsed);
    revalidateTag(TAGS.request(parsed.requestId));
    return null as unknown as void;
  });
}

export async function approveRequest(formData: FormData) {
  return withErrorHandling(async () => {
    const supabase = await getServerSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) throw new ServerActionError("Unauthorized", 401);
    const parsed = requestApproveSchema.parse({
      requestId: String(formData.get("requestId") || ""),
    });
    const repo = new SupabaseRequestsRepository();
    const { request } = await repo.getWithItems(parsed.requestId);
    await requireRole(["admin"], request.orgId);
    const uc = new ApproveRequest(repo);
    await uc.execute({ requestId: parsed.requestId, userId: auth.user.id });
    revalidateTag(TAGS.request(parsed.requestId));
    revalidateTag(TAGS.requestsList);
    revalidateTag(TAGS.movesList);
    return null as unknown as void;
  });
}

export async function rejectRequest(formData: FormData) {
  return withErrorHandling(async () => {
    const supabase = await getServerSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) throw new ServerActionError("Unauthorized", 401);
    const parsed = requestRejectSchema.parse({
      requestId: String(formData.get("requestId") || ""),
      reason: String(formData.get("reason") || ""),
    });
    const repo = new SupabaseRequestsRepository();
    const { request } = await repo.getWithItems(parsed.requestId);
    await requireRole(["admin"], request.orgId);
    const uc = new RejectRequest(repo);
    await uc.execute({ requestId: parsed.requestId, userId: auth.user.id, reason: parsed.reason });
    revalidateTag(TAGS.request(parsed.requestId));
    revalidateTag(TAGS.requestsList);
    return null as unknown as void;
  });
}
