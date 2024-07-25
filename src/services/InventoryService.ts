import Service from "@services/Service";
import InventoryRepo from "@repos/InventoryRepo";
import { IComponent, IInventory } from "@models/Inventory";
import BookingRepo from '@repos/BookingRepo';
import Reservation from "../types/Controller/Booking";
import { IUsage } from "../types/Controller/Inventory";
import envVars from '@shared/env-vars';
import { google } from "googleapis";
class InventoryService extends Service {
    constructor() {
        super(InventoryRepo);
    }
    async bulkCreate(inventories: IInventory[]) {
        return InventoryRepo.bulkCreate(inventories);
    }
    //Create a function calculateUsage to calculate the usage of each item in the inventory
    calculateUsage(guests: number, beds: number, bookings: number): IUsage[] {
        return [{
            name: "Fitted Sheet",
            quantity: beds,
        },
        {
            name: "Small Towel",
            quantity: guests + 2 * bookings,
        },
        {
            name: "Large Towel",
            quantity: guests,
        },
        {
            name: "Bath Mat",
            quantity: bookings,
        },
        {
            name: "Big Pillow",
            quantity: guests,
        },
        {
            name: "Small Pillow",
            quantity: guests,
        },
        {
            name: "Duvet Cover",
            quantity: guests,
        }
        ];
    }
    //Create a function to calculate of Usage
    async calculationOfUsage(): Promise<void> {
        const reservations: Reservation[] = await BookingRepo.fetchReservations();
        const today = new Date().toISOString().split('T')[0];
        let arrival = {
            guests: 0,
            beds: 0,
            bookings: 0
        }
        let departure = {
            guests: 0,
            beds: 0,
            bookings: 0
        }
        reservations.forEach(reservation => {
            if (reservation.arrival === today) {
                arrival.guests += reservation.adults + reservation.children;
                arrival.beds += Math.ceil((reservation.adults + reservation.children) / 2);
                arrival.bookings += 1;
            }
            if (reservation.departure === today) {
                //console.log("reservation.firstname",reservation.firstname);
                departure.guests += reservation.adults + reservation.children;
                departure.beds += Math.ceil((reservation.adults + reservation.children) / 2);
                departure.bookings += 1;
                //console.log("departure.beds", departure.beds );
            }
        });
        if (arrival.bookings > 0) {
            await this.updateInApartment(
                arrival.guests,
                arrival.beds,
                arrival.bookings
            );
        }
        if (departure.bookings > 0) {
            await this.updateUsedInCellar(
                departure.guests,
                departure.beds,
                departure.bookings
            );
        }

        if (arrival.bookings > 0 || departure.bookings > 0) {
            await this.writeToGoogleSheet(departure);
        }

    }
    //Create a function thursdayMorning to shift the inventory from usedInCellar to inLaundry
    async thursdayMorning(): Promise<void> {
        const inventory: IInventory[] = await InventoryRepo.all();
        const bulkOpsL2C = inventory.map((item: IInventory) => ({
            updateOne: {
                filter: { _id: item._id },
                update: {
                    cleanInCellar: item.cleanInCellar + item.inLaundry,
                    inLaundry: 0
                }
            }
        }));
        await InventoryRepo.bulkUpdate(bulkOpsL2C);
        const bulkOps = inventory.map((item: IInventory) => ({
            updateOne: {
                filter: { _id: item._id },
                update: {
                    inLaundry: item.inLaundry + item.usedInCellar,
                    usedInCellar: 0
                }
            }
        }));
        await InventoryRepo.bulkUpdate(bulkOps);
    }
    // //Create a function thursdayEvening to shift the inventory from inLaundry to cleanInCellar
    async thursdayEvening(): Promise<void> {
        const inventory: IInventory[] = await InventoryRepo.all();
        const bulkOps = inventory.map((item: IInventory) => ({
            updateOne: {
                filter: { _id: item._id },
                update: {
                    cleanInCellar: item.cleanInCellar + item.inLaundry,
                    inLaundry: 0
                }
            }
        }));
        await InventoryRepo.bulkUpdate(bulkOps);
    }
    // //Create a function updateInApartment to update the inventory in the apartment
    async updateInApartment(guests: number, beds: number, bookings: number) {
        const inventory: IInventory[] = await InventoryRepo.all();
        const usage: IUsage[] = this.calculateUsage(guests, beds, bookings);
        const bulkOps = inventory.map((item: IInventory) => ({
            updateOne: {
                filter: { _id: item._id },
                update: {
                    inApartment: item.inApartment + (usage?.find(
                        (usageItem: IUsage) => usageItem.name === item.name
                    )?.quantity ?? 0),
                    cleanInCellar: item.cleanInCellar - (usage?.find(
                        (usageItem: IUsage) => usageItem.name === item.name
                    )?.quantity ?? 0)
                }
            }
        }));
        await InventoryRepo.bulkUpdate(bulkOps);
    }
    //Create a function updateUsedInCellar to update the inventory used in the cellar
    async updateUsedInCellar(guests: number, beds: number, bookings: number) {
        const inventory: IInventory[] = await InventoryRepo.all();
        const usage: IUsage[] = this.calculateUsage(guests, beds, bookings);
        const bulkOps = inventory.map((item: IInventory) => ({
            updateOne: {
                filter: { _id: item._id },
                update: {
                    usedInCellar: item.usedInCellar + (usage?.find(
                        (usageItem: IUsage) => usageItem.name === item.name
                    )?.quantity ?? 0),
                    inApartment: item.inApartment - (usage?.find(
                        (usageItem: IUsage) => usageItem.name === item.name
                    )?.quantity ?? 0)
                }
            }
        }));
        await InventoryRepo.bulkUpdate(bulkOps);
    }
    //Write inventory data to google sheet
    async writeToGoogleSheet(departure: { guests: number, beds: number, bookings: number }) {
        const inventory: IInventory[] = await InventoryRepo.all();
        const title = [
            "Calculated Inventory",
            "Total Inventory",
            "In Apartment",
            "Used In Cellar",
            "In Laundry",
            "Clean In Cellar",
            "Control"
        ]
        const inventoryData = inventory.map((item: IInventory) => [
            item.germanName,
            item.totalInventory,
            item.inApartment,
            item.usedInCellar,
            item.inLaundry,
            item.cleanInCellar,
            (item.totalInventory -
                item.inApartment -
                item.usedInCellar -
                item.cleanInCellar -
                item.inLaundry) === 0 ? "OK" : "FEHLER"
        ]);

        const dataToWrite = [title, ...inventoryData];
        //console.log("[title, ...inventoryData]", [title, ...inventoryData]);
        //return [title, ...inventoryData];

        const todayDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        inventoryData.push([`Updated on: ${todayDate}`, "", "", "", "", "", ""]);

        // Add "Calculation of usage" section
        inventoryData.push(["Calculation of usage", "", "", "", "", "", ""]);
        inventoryData.push([`# of guests: ${departure.guests}`, "", "", "", "", "", ""]);
        inventoryData.push([`# of beds: ${departure.beds}`, "", "", "", "", "", ""]);
        inventoryData.push([`Bookings: ${departure.bookings}`, "", "", "", "", "", ""]);

        // Add "Used In Cellar" section
        inventoryData.push(["Usage", "", "", "", "", "", ""]);
        inventory.forEach(item => {
            inventoryData.push([item.germanName, "", "", item.usedInCellar, "", "", ""]);
        });

        // Save the data to Google Sheets
        const client_email = envVars.googleSheets.clientEmail;
        const private_key = envVars.googleSheets.privateKey;
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: client_email,
                private_key: private_key,
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        await auth.getClient();
        const googleSheets = google.sheets({ version: 'v4', auth: auth });

        const spreadsheetId = "191k88eW1b7z2I5McewjRSFHdPcYQjC3tG_tP2kNdd4s";

        // Clear the existing data
        await googleSheets.spreadsheets.values.clear({
            spreadsheetId,
            range: "Laundry!A:G",
        });

        await googleSheets.spreadsheets.values.update({
            spreadsheetId,
            range: "Laundry!A1:G1",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [title],
            },
        });

        await googleSheets.spreadsheets.values.append({
            spreadsheetId,
            range: "Laundry!A2:G",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: inventoryData,
            },
        });
        return dataToWrite;
    }
}

export default new InventoryService();
