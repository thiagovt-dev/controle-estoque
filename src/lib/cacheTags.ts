export const TAGS = {
  products: "products",
  product: (id: string) => `product:${id}`,
  movesList: "moves:list",
  stockProduct: (id: string) => `stock:product:${id}`,
  stockWarehouse: (id: string) => `stock:warehouse:${id}`,
  inventoryList: "inventory:list",
  inventory: (id: string) => `inventory:${id}`,
};
