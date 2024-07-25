import Service from './Service';
import LaundryRepo from '@repos/LaundryRepo';
import BookingRepo from '@repos/BookingRepo';
import Reservation from "../types/Controller/Booking";

class LaundryService extends Service {
  constructor() {
    super(LaundryRepo);
  }
  async saveLaundryDataToDatabase(): Promise<void> {
    try {
      const reservations: Reservation[] = await BookingRepo.fetchReservations();
      await LaundryRepo.saveLaundryDataToDatabase(reservations);
    } catch (error) {
      // console.error("Error in BookingService:");
    }
  }
}

export default new LaundryService();