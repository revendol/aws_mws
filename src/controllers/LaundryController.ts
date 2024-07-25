import { Request, Response } from "express";
import BookingService from "@services/BookingService";
import LaundryService from "@services/LaundryService";
class LaundryController {

  async saveLaundryDataToDatabase(req: Request, res: Response) {
    try {
      await LaundryService.saveLaundryDataToDatabase();
      res.status(200).send("Laundry Data Saved to Database.");
    } catch (error) {
      res.status(500).send("Error saving laundry data.");
    }
  }


}

export default new LaundryController();
