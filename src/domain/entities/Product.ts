export interface Product {
  id: string;
  orgId: string;
  sku: string;
  name: string;
  unitId: string;
  categoryId?: string | null;
  minStock: number;
  active: boolean;
  createdAt?: Date;
}
