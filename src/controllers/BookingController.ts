import { Request, Response } from "express";
import BookingService from "@services/BookingService";
import BookingRepo from "@repos/BookingRepo";
import {success} from "@shared/response";
import ErrorMessage from "@shared/errorMessage";
import StatusCode from "http-status-codes";
const {OK, INTERNAL_SERVER_ERROR} = StatusCode;
import { paginate } from "@util/paginate";
class BookingController {
  async getAllPreviousReservations(req: Request, res: Response) {
    try {
      await BookingService.getAndSavePreviousReservations();
      res.status(200).send("Previous Reservations fetched and saved successfully.");
    } catch (error) {
      res.status(500).send("Error fetching and saving reservations.");
    }
  }

  async getAllReservations(req: Request, res: Response) {
    try {
      const {field, from, to, sort} = req.query;
      const previousReservations = await BookingRepo.fetchPreviousReservationsFromToday();
      const currentReservations  = await BookingRepo.fetchReservations();
      const allReservations = [...previousReservations, ...currentReservations, ];
      const formattedReservations = await BookingRepo.showReservationData(
        allReservations,
        field? field as string : null,
        from ? new Date(from as string):null,
        to ? new Date(to as string):null,
        sort? sort as string : 'asc'
        );
      const page = parseInt(req.query.page as string) || 1;
      const size = parseInt(req.query.size as string) || 20;
      const paginatedData = await paginate(page, size, formattedReservations);
      return res.status(OK).json(success(ErrorMessage.HTTP_OK, paginatedData));
    } catch (error) {
      res.status(INTERNAL_SERVER_ERROR).send("Error fetching and saving reservations.");
    }
  }

  async getAllBrandNewReservations(req: Request, res: Response) {
    try {
      await BookingService.getAndSaveBrandNewReservations();
      res.status(200).send("Reservations fetched and saved successfully.");
    } catch (error) {
      res.status(500).send("Error fetching and saving reservations.");
    }
  }
  async addWhatsappNumber(req: Request, res: Response) {
    try {
      const { whatsappNumberforH, whatsappNumberforL } = req.body;
      await BookingService.addWhatsappNumber(whatsappNumberforH, whatsappNumberforL);
      res.status(200).send("Whatsapp Number Added Successfully.");
  } catch (error) {
    res.status(500).send("Error Adding Whatsapp Number");
  }
}
}

export default new BookingController();
