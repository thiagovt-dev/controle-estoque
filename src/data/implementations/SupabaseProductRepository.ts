import { getServerSupabase } from "../../infra/supabase/server";
import { Product } from "../../domain/entities/Product";
import { CreateProductInput, ProductRepository } from "../../domain/use-cases/CreateProduct";
import { productMapper } from "../mappers/ProductMapper";

export class SupabaseProductRepository implements ProductRepository {
  async create(input: CreateProductInput): Promise<Product> {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase
      .from("products")
      .insert({
        org_id: input.orgId,
        sku: input.sku,
        name: input.name,
        unit_id: input.unitId,
        category_id: input.categoryId ?? null,
        min_stock: input.minStock,
        active: input.active,
      })
      .select("*")
      .single();
    if (error) throw error;
    return productMapper.toDomain(data);
  }

  async listByOrg(orgId: string): Promise<Product[]> {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("org_id", orgId)
      .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(productMapper.toDomain);
  }
}
