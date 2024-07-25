import Reservation from "../types/Controller/Booking";
import { google } from "googleapis";
import axios, { AxiosResponse } from "axios";
import twilio from "twilio";
import envVars from '@shared/env-vars';
import Booking, { IBooking } from "@models/Booking";
import WhatsappNumber, {IMessage, IWhatsappNumber} from "@models/WhatsappNumber";
import moment from "moment";
import {trim} from "twilio/lib/base/utility";

const accountSid = envVars.twilioData.accountSid;
const authToken = envVars.twilioData.authToken;
const tClient = twilio(accountSid, authToken);
//const whatsappNumber1 = 'whatsapp:+8801760044342';
//const whatsappNumber2 = 'whatsapp:+8801711262905';

class BookingRepo {
  async fetchWhatsappNumbers(): Promise<{ whatsappNumber1: string, whatsappNumber2: string }> {
    const whatsappNumbers = await WhatsappNumber.findOne();
    if (whatsappNumbers) {
      return {
        whatsappNumber1: whatsappNumbers.whatsappNumber1,
        whatsappNumber2: whatsappNumbers.whatsappNumber2,
      };
    } else {
      throw new Error("WhatsApp numbers not found in the database");
    }
  }

  async fetchPreviousReservationsFromToday(): Promise<Reservation[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response: AxiosResponse<{ bookings: Reservation[] }> =
        await axios.get('https://login.smoobu.com/api/reservations?' +
          'from=2023-01-01&to=2024-07-10', {
          headers: {
            'Api-Key': 'yZoShv37a8QwBQlCvQ2qkyOcPdeElFMPLlI4G5os7E',
            'Cache-Control': 'no-cache'
          },
          params: {
            created_to: today,
          }
        });
      //console.log("response.data", response.data);
      return response.data.bookings;
    } catch (error) {
      throw new Error(`Failed to fetch reservations`);
    }
  }

  async savePreviousReservationToGoogleSheets(reservations: Reservation[]) {
    try {
      //console.log("Raw reservations:", reservations);

      const reservationArray = reservations || [];
      //console.log("reservations (first 3):", reservationArray.slice(0, 3));

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

      await googleSheets.spreadsheets.values.clear({
        spreadsheetId,
        range: "Worksheet!A:Y",
      });

      const titles = [
        ["Position", "Arrival", "Departure", "Apartment", "Portal",
          "Eingetragen am", "Adresse", "Adults", "Kids", "Check-In", "Check-Out",
          "Notes", "Price", "Preiseinstellungen", "Provision enthalten",
          "City tax", "Bezahlt", "Anzahlung", "Anzahlung erledigt",
          "# of nights", "Status", "Notiz für Assistenten", "# of guests",
          "Total CB for stay", "Total CB per night"]
      ];
      //Set title on the first row of the Google sheet
      await googleSheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Previous Data!A1:Y1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: titles,
        },
      });

      await googleSheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: 0,
                  endRowIndex: 1,
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: {
                      bold: true,
                    },
                  },
                },
                fields: "userEnteredFormat.textFormat.bold",
              },
            },
          ],
        },
      });

      let nearestDeparture: Date | null = null;
      let nearestApartments: string[] = [];
      let rowIndex = 2;
      const values = reservationArray.map((reservation: Reservation) => {
        const arrivalDate = new Date(reservation.arrival);
        const departureDate = new Date(reservation.departure);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const numberOfNights =
          (departureDate.getTime() - arrivalDate.getTime()) / (1000 * 3600 * 24);
        const numberOfGuests = (reservation.adults ?? 0) + (reservation.children ?? 0);

        if (departureDate.getTime() === today.getTime()) {
          nearestDeparture = departureDate;
          nearestApartments = [reservation.apartment.name];
        } else if (!nearestDeparture ||
          (departureDate > today && departureDate < nearestDeparture)) {
          nearestDeparture = departureDate;
          nearestApartments = [reservation.apartment.name];
        } else if (nearestDeparture && departureDate.getTime() === nearestDeparture.getTime()) {
          nearestApartments.push(reservation.apartment.name);
        }

        const row = [
          reservation.id,
          reservation.arrival,
          reservation.departure,
          reservation.apartment.name,
          reservation.channel.name,
          reservation['created-at'],
          "N/A",
          (reservation.adults ?? 0).toString(),
          (reservation.children ?? 0).toString(),
          reservation['check-in'],
          reservation['check-out'],
          reservation.notice,
          reservation.price,
          reservation['price-details'],
          reservation['commission-included'],
          reservation['city-tax'] !== null ? reservation['city-tax'] : "No",
          reservation['price-paid'],
          reservation['prepayment-paid'],
          reservation['deposit-paid'],
          numberOfNights.toFixed(2),
          'Gebucht',
          reservation['assistant-notice'],
          numberOfGuests.toFixed(2),
          `=ROUND(IF(W${rowIndex}=0,0,M${rowIndex}-O${rowIndex}-M${rowIndex}*
          'Contribution Margin'!$C$6-W${rowIndex}*'Contribution Margin'!$C$4-
          'Contribution Margin'!$C$5), 2)`,
          `=ROUND(X${rowIndex}/T${rowIndex}, 2)`
        ];

        rowIndex++;
        return row;
      });

      await googleSheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Previous Data!A2:Y",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values,
        },
      });
      if (nearestDeparture) {
        //console.log("nearestDeparture", nearestDeparture);
        const formattedDate = (nearestDeparture as Date).toLocaleDateString('en-GB');
        const messages = nearestApartments.map(apartment => {
          const nearestReservation = reservationArray.find((reservation: Reservation) =>
            reservation.apartment.name === apartment &&
            new Date(reservation.departure).getTime() === nearestDeparture?.getTime()
          );

          const nextNearestReservation = reservationArray
            .filter((reservation: Reservation) => reservation.apartment.name === apartment
              && nearestDeparture && new Date(reservation.arrival) > nearestDeparture)
            .sort((a, b) => new Date(a.arrival).getTime() - new Date(b.arrival).getTime())[0];

          const nextArrivalDate =
            nextNearestReservation ?
              new Date(nextNearestReservation.arrival).toLocaleDateString('en-GB') : "N/A";
          const nextNumberOfGuests =
            nextNearestReservation ?
              (nextNearestReservation.adults + nextNearestReservation.children).toFixed(2) : "N/A";
          const nextNumberOfNights =
            nextNearestReservation ?
              ((new Date(nextNearestReservation.departure).getTime()
                - new Date(nextNearestReservation.arrival).getTime())
                / (1000 * 3600 * 24)).toFixed(2) : "N/A";

          if (nearestReservation) {
            return `Day of Cleaning: ${formattedDate}, 
            [Apartment: ${apartment},
            Checkout Time: ${nearestReservation['check-out']},
            Next nearest arrival date: ${nextArrivalDate},
            # of guests: ${nextNumberOfGuests},
            # of nights: ${nextNumberOfNights},
            Specials: ${nearestReservation['assistant-notice']}]`;
          }
          return '';
        });

        for (const message of messages) {
          if (message) {
            console.log("message", message);
            // await tClient.messages.create({
            //   body: message,
            //   from: 'whatsapp:+14155238886',
            //   to: whatsappNumber
            // });
          }
        }
        //console.error("successfully written to sheets");
      }

    } catch (error) {
      //console.error("Error writing to sheets");
    }
  }

  async fetchReservations(): Promise<Reservation[]> {
    try {
      const response: AxiosResponse<{ bookings: Reservation[] }> =
        await axios.get('https://login.smoobu.com/api/reservations', {
          headers: {
            'Api-Key': 'yZoShv37a8QwBQlCvQ2qkyOcPdeElFMPLlI4G5os7E',
            'Cache-Control': 'no-cache'
          }
        });
      //console.log("response.data", response.data);
      return response.data.bookings;
    } catch (error) {
      throw new Error(`Failed to fetch reservations`);
    }
  }

  async saveToGoogleSheets(reservations: Reservation[]) : Promise<any> {
    const dataToSaveOnGoogleSheet : any[] = [
      [
        "Position",
        "Arrival",
        "Departure",
        "Apartment",
        "Portal",
        "Eingetragen am",
        "Adresse",
        "Adults",
        "Kids",
        "Check-In",
        "Check-Out",
        "Notes",
        "Price",
        "Preiseinstellungen",
        "Provision enthalten",
        "City tax",
        "Bezahlt",
        "Anzahlung",
        "Anzahlung erledigt",
        "# of nights",
        "Status",
        "Notiz für Assistenten",
        "# of guests",
        "Total CB for stay",
        "Total CB per night"
      ]
    ]
    reservations.map((reservation: Reservation, rowIndex:number) => {
      dataToSaveOnGoogleSheet.push([
        reservation.id,
        reservation.arrival,
        reservation.departure,
        reservation.apartment.name,
        reservation.channel.name,
        reservation['created-at'],
        reservation.apartment.name,
        reservation.adults,
        reservation.children,
        reservation['check-in'],
        reservation['check-out'],
        reservation.notice,
        reservation.price,
        reservation['price-details'],
        reservation['commission-included'],
        reservation['city-tax'],
        reservation['price-paid'],
        reservation['prepayment-paid'],
        reservation['deposit-paid'],
        ((new Date(reservation.departure).getTime() - new Date(reservation.arrival).getTime()) / (1000 * 3600 * 24)),
        "Gebucht",
        reservation['assistant-notice'],
        reservation.adults??0 + reservation.children??0,
        `=ROUND(IF(W${rowIndex+2}=0,0,M${rowIndex+2}-O${rowIndex+2}-M${rowIndex+2}*
          'Contribution Margin'!$C$6-W${rowIndex+2}*'Contribution Margin'!$C$4-
          'Contribution Margin'!$C$5), 2)`,
        `=ROUND(X${rowIndex+2}/T${rowIndex+2}, 2)`
      ])
    });
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: envVars.googleSheets.clientEmail,
        private_key: envVars.googleSheets.privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    await auth.getClient();
    const googleSheets = google.sheets({ version: 'v4', auth: auth });
    const spreadsheetId = "191k88eW1b7z2I5McewjRSFHdPcYQjC3tG_tP2kNdd4s";
    const range = "Worksheet!A:Y";
    const requestBody = {values: dataToSaveOnGoogleSheet};
    //Write values to the Google sheet
    const response = await googleSheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody,
    });
    return dataToSaveOnGoogleSheet;
  }

  async sendMessagesToWhatsapp(reservations: Reservation[]) {
    try {
      const {whatsappNumber1, whatsappNumber2} = await this.fetchWhatsappNumbers();
      const messages : IMessage[] = [];
      const today = moment().set({hour:0,minute:0,second:0,millisecond:0}).toDate();
      //Get today's departure
      const todayDepartures = reservations.filter((reservation: Reservation) => {
        const departureDate = moment(reservation.departure, 'YYYY-MM-DD').toDate();
        return departureDate.getTime() === today.getTime();
      });
      //If today's departure is not blocked booking then write message for it
      if (todayDepartures.length > 0) {
        const formattedDate = today.toLocaleDateString('en-GB');
        todayDepartures.map((reservation: Reservation) => {
          if(reservation.channel.name !== "Blocked channel") {
            //Find next closest reservation by arrival date and same apartment
            const nextReservation = reservations
              .filter((res: Reservation) => {
                const arrivalDate = moment(res.arrival, 'YYYY-MM-DD').toDate();
                return arrivalDate.getTime() > today.getTime() &&
                  res.apartment.name === reservation.apartment.name &&
                  res.channel.name !== "Blocked channel";
              })
              .sort((a, b) => {
                const dateA = moment(a.arrival, 'YYYY-MM-DD').toDate();
                const dateB = moment(b.arrival, 'YYYY-MM-DD').toDate();
                return dateA.getTime() - dateB.getTime();
              })[0];
            if(nextReservation) {
              const msg : IMessage = {
                cleanedDate: formattedDate,
                apartment: reservation.apartment.name,
                checkOut: reservation['check-out'],
                nextArrivalDate: moment(nextReservation.arrival, 'YYYY-MM-DD').toDate().toLocaleDateString('en-GB'),
                nextCheckIn: nextReservation['check-in'],
                guest: (nextReservation.adults + nextReservation.children),
                nights: ((moment(nextReservation.departure, 'YYYY-MM-DD').toDate().getTime()
                  - moment(nextReservation.arrival, 'YYYY-MM-DD').toDate().getTime()) / (1000 * 3600 * 24)),
                special: trim(reservation['assistant-notice'])||'N/A',
                cleanerContact: reservation.apartment.name.includes('H') ? whatsappNumber1 : whatsappNumber2
              }
              messages.push(msg);
            }
            return;
          }
        });
      }
      //Send messages to whatsapp
      messages.map(async (message: IMessage) => {
        const msg = `Day of Cleaning: ${message.cleanedDate}, 
Apartment: ${message.apartment},
Checkout Time: ${message.checkOut},
Next guest arrival date: ${message.nextArrivalDate},
Next guest check-in time: ${message.nextCheckIn},
Number of guests: ${message.guest},
Number of nights: ${message.nights},
Specials: ${message.special}]`;

        await tClient.messages.create({
          body: msg,
          from: 'whatsapp:+14155238886',
          to: message.cleanerContact
        });
      });
    } catch (error : any) {
      console.error("Error sending messages to whatsapp", error);
    }
  }

  async showReservationData(
    reservations: Reservation[],
    field: string | null,
    from: Date | null,
    to: Date | null,
    sort: string | 'asc' | 'desc'
  ) {
    try {
      let filteredReservations = reservations || [];
      if(from === null && to === null) {
        return filteredReservations;
      }
      if(field === null && from instanceof Date && to === null) {
        filteredReservations = reservations.filter(reservation => {
          const createdAt = new Date(reservation['created-at']);
          return createdAt.toISOString().split('T')[0] >= from.toISOString().split('T')[0];
        });
      }
      if(field === null && from === null && to instanceof Date) {
        filteredReservations = reservations.filter(reservation => {
          const createdAt = new Date(reservation['created-at']);
          return createdAt.toISOString().split('T')[0] <= to.toISOString().split('T')[0];
        });
      }
      if(field === null && from instanceof Date && to instanceof Date) {
        filteredReservations = reservations.filter(reservation => {
          const createdAt = new Date(reservation['created-at']);
          return createdAt.toISOString().split('T')[0] >= from.toISOString().split('T')[0] &&
            createdAt.toISOString().split('T')[0] <= to.toISOString().split('T')[0];
        });
      }
      if(field === "arrival" && from instanceof Date && to === null) {
        filteredReservations = reservations.filter(reservation => {
          const arrivalDate = new Date(reservation.arrival);
          return arrivalDate.toISOString().split('T')[0] >= from.toISOString().split('T')[0];
        });
      }
      if(field === "arrival" && from === null && to instanceof Date) {
        filteredReservations = reservations.filter(reservation => {
          const arrivalDate = new Date(reservation.arrival);
          return arrivalDate.toISOString().split('T')[0] <= to.toISOString().split('T')[0];
        });
      }
      if(field === "arrival" && from instanceof Date && to instanceof Date) {
        filteredReservations = reservations.filter(reservation => {
          const arrivalDate = new Date(reservation.arrival);
          return arrivalDate.toISOString().split('T')[0] >= from.toISOString().split('T')[0] &&
            arrivalDate.toISOString().split('T')[0] <= to.toISOString().split('T')[0];
        });
      }
      if(field === "departure" && from instanceof Date && to === null) {
        filteredReservations = reservations.filter(reservation => {
          const departureDate = new Date(reservation.departure);
          return departureDate.toISOString().split('T')[0] >= from.toISOString().split('T')[0];
        });
      }
      if(field === "departure" && from === null && to instanceof Date) {
        filteredReservations = reservations.filter(reservation => {
          const departureDate = new Date(reservation.departure);
          return departureDate.toISOString().split('T')[0] <= to.toISOString().split('T')[0];
        });
      }
      if(field === "departure" && from instanceof Date && to instanceof Date) {
        filteredReservations = reservations.filter(reservation => {
          const departureDate = new Date(reservation.departure);
          return departureDate.toISOString().split('T')[0] >= from.toISOString().split('T')[0] &&
            departureDate.toISOString().split('T')[0] <= to.toISOString().split('T')[0];
        });
      }
      if(sort === 'asc' && field === null) {
        filteredReservations.sort((a, b) => {
          const dateA = new Date(a['created-at']);
          const dateB = new Date(b['created-at']);
          return dateA.getTime() - dateB.getTime();
        });
      }
      if(sort === 'desc' && field === null) {
        filteredReservations.sort((a, b) => {
          const dateA = new Date(a['created-at']);
          const dateB = new Date(b['created-at']);
          return dateB.getTime() - dateA.getTime();
        });
      }
      if(sort === 'asc' && field === "arrival") {
        filteredReservations.sort((a, b) => {
          const dateA = new Date(a.arrival);
          const dateB = new Date(b.arrival);
          return dateA.getTime() - dateB.getTime();
        });
      }
      if(sort === 'desc' && field === "arrival") {
        filteredReservations.sort((a, b) => {
          const dateA = new Date(a.arrival);
          const dateB = new Date(b.arrival);
          return dateB.getTime() - dateA.getTime();
        });
      }
      if(sort === 'asc' && field === "departure") {
        filteredReservations.sort((a, b) => {
          const dateA = new Date(a.departure);
          const dateB = new Date(b.departure);
          return dateA.getTime() - dateB.getTime();
        });
      }
      if(sort === 'desc' && field === "departure") {
        filteredReservations.sort((a, b) => {
          const dateA = new Date(a.departure);
          const dateB = new Date(b.departure);
          return dateB.getTime() - dateA.getTime();
        });
      }

      const calculateContributionMargin = (
        w: number,
        m: number,
        o: number,
        contributionMarginC6: number,
        contributionMarginC4: number,
        contributionMarginC5: number
      ): number => {
        if (w === 0) {
          return 0;
        } else {
          const result = m - o - m * contributionMarginC6 - w * contributionMarginC4 - contributionMarginC5;
          return Math.round(result * 100) / 100;
        }
      };
      const CONTRIBUTION_MARGIN_C6 = 0.12; // 12%
      const CONTRIBUTION_MARGIN_C4 = 11;
      const CONTRIBUTION_MARGIN_C5 = 3 * 19.5 * 1.2; 

      let rowIndex= 1;
      const values = filteredReservations.map((reservation: Reservation) => {
        const arrivalDate = new Date(reservation.arrival);
        const departureDate = new Date(reservation.departure);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const numberOfNights =
        (departureDate.getTime() - arrivalDate.getTime()) / (1000 * 3600 * 24);
        const numberOfGuests = (reservation.adults ?? 0) + (reservation.children ?? 0);
        const commissionIncluded = reservation['commission-included'] ?? 0;
        const totalCBForStay = calculateContributionMargin(
          numberOfGuests, reservation.price, commissionIncluded, CONTRIBUTION_MARGIN_C6, CONTRIBUTION_MARGIN_C4, CONTRIBUTION_MARGIN_C5
        );
        const totalCBPerNight = numberOfNights > 0 ? (totalCBForStay / numberOfNights).toFixed(2) : "0.00";
        const result = {
          "Serial": rowIndex,
          "Position": reservation.id,
          "Arrival": reservation.arrival,
          "Departure": reservation.departure,
          "Apartment": reservation.apartment.name,
          "Portal": reservation.channel.name,
          "Eingetragen am": reservation['created-at'],
          "Adresse": "N/A",
          "Adults": (reservation.adults ?? 0).toString(),
          "Kids": (reservation.children ?? 0).toString(),
          "Check-In": reservation['check-in'],
          "Check-Out": reservation['check-out'],
          "Notes": reservation.notice,
          "Price": reservation.price,
          "Preiseinstellungen": reservation['price-details'],
          "Provision enthalten": commissionIncluded,
          "City tax": reservation['city-tax'] !== null ? reservation['city-tax'] : "No",
          "Bezahlt": reservation['price-paid'],
          "Anzahlung": reservation['prepayment-paid'],
          "Anzahlung erledigt": reservation['deposit-paid'],
          "# of nights": numberOfNights.toFixed(2),
          "Status": 'Gebucht',
          "Notiz für Assistenten": reservation['assistant-notice'],
          "# of guests": numberOfGuests.toFixed(2),
          "Total CB for stay": totalCBForStay.toFixed(2),
          "Total CB per night": totalCBPerNight
        };
        rowIndex++;
        return result;
      });
      return values;
    } catch (error) {
      throw new Error("Error formatting reservation data");
    }
  }

  // Bulk create function
  async bulkCreateIfNotExist(docs: IBooking[]): Promise<boolean> {
    const bulkOps = docs.map(doc => ({
      updateOne: {
        filter: { field1: doc.position },
        update: { $setOnInsert: doc },
        upsert: true
      }
    }));
    try {
      const result = await Booking.bulkWrite(bulkOps);
      return result.upsertedCount === docs.length;
    } catch (error) {
      console.error('Bulk operation error:', error);
      return false;
    }
  }

  async addWhatsappNumber(whatsappNumber1: string, whatsappNumber2: string): Promise<IWhatsappNumber> {
    await WhatsappNumber.deleteMany({});
    const whatsappNumber = new WhatsappNumber({ whatsappNumber1, whatsappNumber2 });
    return await whatsappNumber.save();
  }
}

export default new BookingRepo();