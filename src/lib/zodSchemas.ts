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
