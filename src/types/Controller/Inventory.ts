interface InventoryInput {
  germanName?: string;
  name?: string;
  totalInventory: number;
  inApartment: number;
  usedInCellar: number;
  inLaundry: number;
  cleanInCellar: number;
}

export interface IUsage {
  name: string;
  quantity: number;
}

export default InventoryInput;