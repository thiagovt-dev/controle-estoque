export class ApproveRequest {
  constructor(
    private repo: { approve(input: { requestId: string; userId: string }): Promise<void> }
  ) {}
  async execute(input: { requestId: string; userId: string }) {
    return this.repo.approve(input);
  }
}
