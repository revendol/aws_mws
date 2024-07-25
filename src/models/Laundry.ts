import {Schema, model} from "mongoose";

export interface ILaundry {
  _id?: string;
  date: string;
  numberOfGuests: number;
  numberOfBeds: number;
  numberOfBookings: number;
}

// Create a Schema corresponding to the document interface.
const laundrySchema = new Schema<ILaundry>({
  date: { type: String, trim: true },
  numberOfGuests: {type: Number, trim: true, default: 0},
  numberOfBeds: {type: Number, trim: true, default: 0},
  numberOfBookings: {type: Number, trim: true, default: 0},
}, {timestamps: true});

// Create a Model.
export default model<ILaundry>('Laundry', laundrySchema);
