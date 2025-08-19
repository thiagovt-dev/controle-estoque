import { Product } from "../../domain/entities/Product";

export const productMapper = {
  toDomain: (row: any): Product => ({
    id: row.id,
    orgId: row.org_id,
    sku: row.sku,
    name: row.name,
    unitId: row.unit_id,
    categoryId: row.category_id,
    minStock: Number(row.min_stock),
    active: row.active,
    createdAt: row.created_at ? new Date(row.created_at) : undefined,
  }),
};
