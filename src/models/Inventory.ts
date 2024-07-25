import {Schema, model} from "mongoose";

export interface IComponent {
  quantity: number;
}

export interface IInventory {
  _id?: string;
  germanName: string;
  name: string;
  totalInventory: number;
  inApartment: number;
  usedInCellar: number;
  inLaundry: number;
  cleanInCellar: number;
}

// Create a Schema corresponding to the document interface.
const inventorySchema = new Schema<IInventory>({
  germanName: {type: String, trim: true, required: true},
  name: {type: String, trim: true, required: true},
  totalInventory: {type: Number, trim: true, default: 0},
  inApartment: {type: Number, trim: true, default: 0},
  usedInCellar: {type: Number, trim: true, default: 0},
  cleanInCellar: {type: Number, trim: true, default: 0},
  inLaundry: {type: Number, trim: true, default: 0},
}, {timestamps: true});

// Create a Model.
export default model<IInventory>('Inventory', inventorySchema);
