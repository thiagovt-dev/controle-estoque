import { Product } from "../entities/Product";
import { ProductRepository } from "./CreateProduct";

export class ListProducts {
  constructor(private repo: ProductRepository) {}
  async execute(orgId: string): Promise<Product[]> {
    return this.repo.listByOrg(orgId);
  }
}
