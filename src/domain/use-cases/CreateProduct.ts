import { Product } from "../entities/Product";

export interface CreateProductInput {
  orgId: string;
  sku: string;
  name: string;
  unitId: string;
  categoryId?: string | null;
  minStock: number;
  active: boolean;
}

export interface ProductRepository {
  create(data: CreateProductInput): Promise<Product>;
  listByOrg(orgId: string): Promise<Product[]>;
}

export class CreateProduct {
  constructor(private repo: ProductRepository) {}
  async execute(input: CreateProductInput) {
    return this.repo.create(input);
  }
}
