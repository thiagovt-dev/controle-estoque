import { Request } from "../entities/Request";

export interface OpenRequestInput {
  orgId: string;
  departmentId: string;
  warehouseId: string;
  userId: string;
}

export interface RequestsRepository {
  open(input: OpenRequestInput): Promise<Request>;
  addItem(input: { requestId: string; productId: string; qty: number }): Promise<void>;
  approve(input: { requestId: string; userId: string }): Promise<void>;
  reject(input: { requestId: string; userId: string; reason: string }): Promise<void>;
  getWithItems(
    id: string
  ): Promise<{
    request: Request;
    items: Array<{ id: string; productId: string; productName: string; sku: string; qty: number }>;
  }>;
  listByOrg(orgId: string): Promise<Request[]>;
}

export class OpenRequest {
  constructor(private repo: RequestsRepository) {}
  async execute(input: OpenRequestInput) {
    return this.repo.open(input);
  }
}
