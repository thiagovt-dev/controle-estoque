import { z } from "zod";

export const productSchema = z.object({
  orgId: z.string().uuid(),
  sku: z.string().min(1),
  name: z.string().min(1),
  unitId: z.string().uuid(),
  categoryId: z.string().uuid().nullable().optional(),
  minStock: z.coerce.number().nonnegative(),
  active: z.boolean().default(true),
});

export const moveSchema = z.object({
  orgId: z.string().uuid(),
  type: z.enum(["IN", "OUT", "TRANSFER"]),
  productId: z.string().uuid(),
  warehouseFromId: z.string().uuid().nullable().optional(),
  warehouseToId: z.string().uuid().nullable().optional(),
  qty: z.coerce.number().positive(),
  reason: z.string().nullable().optional(),
  refId: z.string().nullable().optional(),
});

export const inventoryOpenSchema = z.object({
  orgId: z.string().uuid(),
  warehouseId: z.string().uuid(),
});

export const inventoryItemSchema = z.object({
  inventoryId: z.string().uuid(),
  productId: z.string().uuid(),
  countedQty: z.coerce.number(),
});

export const inventoryCloseSchema = z.object({
  inventoryId: z.string().uuid(),
});


export const requestOpenSchema = z.object({
  orgId: z.string().uuid(),
  departmentId: z.string().uuid(),
  warehouseId: z.string().uuid(),
});

export const requestItemSchema = z.object({
  requestId: z.string().uuid(),
  productId: z.string().uuid(),
  qty: z.coerce.number().positive(),
});

export const requestApproveSchema = z.object({
  requestId: z.string().uuid(),
});

export const requestRejectSchema = z.object({
  requestId: z.string().uuid(),
  reason: z.string().min(1),
});