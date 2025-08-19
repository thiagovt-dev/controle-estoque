export type RequestStatus = "pending" | "approved" | "rejected";

export interface Request {
  id: string;
  orgId: string;
  departmentId: string;
  warehouseId: string;
  status: RequestStatus;
  createdBy: string;
  createdAt: Date;
  approvedBy?: string | null;
  approvedAt?: Date | null;
  rejectedBy?: string | null;
  rejectedAt?: Date | null;
  rejectionReason?: string | null;
}

export interface RequestItem {
  id: string;
  requestId: string;
  productId: string;
  qty: number;
}
