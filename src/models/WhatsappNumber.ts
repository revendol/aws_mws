import { Schema, model } from "mongoose";
import moment from "moment/moment";

export interface IWhatsappNumber {
  _id?: string;
  whatsappNumber1: string;
  whatsappNumber2: string;
}

export interface IMessage {
  cleanedDate: string;
  apartment: string;
  checkOut: string;
  nextArrivalDate: string;
  nextCheckIn: string;
  guest: number;
  nights: number;
  special: string;
  cleanerContact: string;
}

const whatsappNumberSchema = new Schema<IWhatsappNumber>({
  whatsappNumber1: { type: String, required: true, trim: true },
  whatsappNumber2: { type: String, trim: true }
}, { timestamps: true });

export default model<IWhatsappNumber>('WhatsappNumber', whatsappNumberSchema);
