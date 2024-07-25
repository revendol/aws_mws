import BookingRepo from "@repos/BookingRepo";
import Reservation from "../types/Controller/Booking";

class BookingService {
  async getAndSavePreviousReservations(): Promise<void> {
    try {
      const reservations: Reservation[] = await BookingRepo.fetchPreviousReservationsFromToday();
      await BookingRepo.savePreviousReservationToGoogleSheets(reservations);
    } catch (error) {
      // console.error("Error in BookingService:");
    }
  }

  async getAndSaveBrandNewReservations(): Promise<any> {
    try {
      const reservations: Reservation[] = await BookingRepo.fetchReservations();
      await BookingRepo.saveToGoogleSheets(reservations);
      await BookingRepo.sendMessagesToWhatsapp(reservations);
    } catch (error) {
      // console.error("Error in BookingService:");
    }
  }
  async sendMessagesToWhatsapp(): Promise<void> {
    try {
      const reservations: Reservation[] = await BookingRepo.fetchReservations();
      await BookingRepo.sendMessagesToWhatsapp(reservations);
    } catch (error:any) {
      console.error("Error in BookingService sending message: ", error);
    }
  }
  async addWhatsappNumber(number1: string, number2: string): Promise<void> {
    let whatsappNumber1= `whatsapp:${number1}`;
    let whatsappNumber2= `whatsapp:${number2}`;
    await BookingRepo.addWhatsappNumber(whatsappNumber1, whatsappNumber2);
  }

}

export default new BookingService();
