import {Schema, model} from "mongoose";

export interface IBooking {
  _id?: string;
  position: string;
  arrival: Date;
  departure: Date;
  apartment: string;
  portal: string;
  registeredOn: Date;
  address: string;
  adults: number;
  kids: number;
  checkIn: string;
  checkOut: string;
  notes: string;
  price: number;
  priceSettings: string;
  commissionIncluded: number;
  cityTax: number;
  paid: boolean;
  downPayment: boolean;
  depositCompleted: boolean;
  numberOfNights: number;
  status: string;
  noteFotAssistants: string;
  numberOfGuests: number;
  totalCBForStay: number;
  totalCBPerNight: number;
  laundryCalculated?: boolean;
}

// Create a Schema corresponding to the document interface.
const userSchema = new Schema<IBooking>({
  position: {type: String, trim: true, required: true},
  arrival: {type: Date, trim: true, required: true},
  departure: {type: Date, trim: true, required: true},
  apartment: {type: String, trim: true, required: true},
  portal: {type: String, trim: true, required: true},
  registeredOn: {type: Date, trim: true, required: true},
  address: {type: String, trim: true, required: true},
  adults: {type: Number, trim: true, default: 0},
  kids: {type: Number, trim: true, default: 0},
  checkIn: {type: String, trim: true, required: true},
  checkOut: {type: String, trim: true, required: true},
  notes: {type: String, trim: true, required: true},
  price: {type: Number, trim: true, default: 0},
  priceSettings: {type: String, trim: true},
  commissionIncluded: {type: Number, trim: true, default: 0},
  cityTax: {type: Number, trim: true, default: 0},
  paid: {type: Boolean, trim: true, required: true},
  downPayment: {type: Boolean, trim: true, required: true},
  depositCompleted: {type: Boolean, trim: true, required: true},
  numberOfNights: {type: Number, trim: true, default: 0},
  status: {type: String, trim: true},
  noteFotAssistants: {type: String, trim: true},
  numberOfGuests: {type: Number, trim: true, default: 0},
  totalCBForStay: {type: Number, trim: true, default: 0},
  totalCBPerNight: {type: Number, trim: true, default: 0},
  laundryCalculated: {type: Boolean, trim: true, required: true}
}, {timestamps: true});

// Create a Model.
export default model<IBooking>('Booking', userSchema);
