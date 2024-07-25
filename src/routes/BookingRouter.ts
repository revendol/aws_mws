import { Router } from 'express';
import BookingController from "@controllers/BookingController";
import LaundryController from "@controllers/LaundryController";

const router = Router();

export const p = {
  basePath: '/booking',
  allReservations: '/allReservations',
  allLaundryInformation: '/allLaundryInformation',
  allPreviousReservations: '/allPreviousReservations',
  allBrandNewReservations: '/allBrandNewReservations',
  saveLaundryDataToDatabase: '/saveLaundryDataToDatabase',
  addWhatsappNumber: '/addWhatsappNumber'
} as const;

router.get(
  p.allReservations,
  (req, res) =>
    BookingController.getAllReservations(req, res)
);

router.get(
  p.allPreviousReservations,
  (req, res) =>
    BookingController.getAllPreviousReservations(req, res)
);

router.get(
  p.allBrandNewReservations,
  (req, res) =>
    BookingController.getAllBrandNewReservations(req, res)
);
router.post(
  p.addWhatsappNumber,
  (req, res) =>
    BookingController.addWhatsappNumber(req, res)
);
router.get(
  p.saveLaundryDataToDatabase,
  (req, res) =>
    LaundryController.saveLaundryDataToDatabase(req, res)
);

export default router;
