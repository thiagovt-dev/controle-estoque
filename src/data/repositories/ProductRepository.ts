import { Product } from "../../domain/entities/Product";
import { CreateProductInput, ProductRepository } from "../../domain/use-cases/CreateProduct";

export type { ProductRepository, CreateProductInput };

export interface ProductMapper {
  toDomain(row: any): Product;
}
