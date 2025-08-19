export class RejectRequest {
  constructor(
    private repo: {
      reject(input: { requestId: string; userId: string; reason: string }): Promise<void>;
    }
  ) {}
  async execute(input: { requestId: string; userId: string; reason: string }) {
    return this.repo.reject(input);
  }
}
