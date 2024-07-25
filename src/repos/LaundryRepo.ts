import Repo from './Repo';
import Laundry, { ILaundry }  from "@models/Laundry";
import Reservation from "../types/Controller/Booking";

class LaundryRepo extends Repo {
    constructor(){
        super(Laundry);
    }
    async saveLaundryDataToDatabase(reservations: Reservation[]) {
        try {
          // const today = new Date().toISOString().split('T')[0];
          // const todayReservations = reservations.filter(reservation =>
          //   reservation.arrival <= today && reservation.departure >= today
          // );
          //
          // let totalNumberOfGuests = 0;
          // let totalNumberOfBeds = 0;
          // let totalNumberOfBookings = todayReservations.length;
          //
          // //console.log("todayReservations", todayReservations);
          // todayReservations.forEach(reservation => {
          //   const numberOfGuests = reservation.adults + reservation.children;
          //   totalNumberOfGuests += numberOfGuests;
          //   totalNumberOfBeds += Math.ceil(numberOfGuests / 2);
          // });
          //
          // const laundryData: ILaundry = {
          //   date: today,
          //   numberOfGuests: totalNumberOfGuests,
          //   numberOfBeds: totalNumberOfBeds,
          //   numberOfBookings: totalNumberOfBookings
          // };
          //
          // //console.log("laundryData", laundryData);
          //
          // const laundry = new Laundry(laundryData);
          // await laundry.save();
    
          //console.log("Laundry data saved to database:", laundry);
    
          //   }
          // )
        } catch (error) {
          //console.error("Error writing to database:", error.message);
        }
      }
}
export default new LaundryRepo();