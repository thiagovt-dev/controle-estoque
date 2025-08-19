export class AddRequestItem {
  constructor(
    private repo: {
      addItem(input: { requestId: string; productId: string; qty: number }): Promise<void>;
    }
  ) {}
  async execute(input: { requestId: string; productId: string; qty: number }) {
    return this.repo.addItem(input);
  }
}
