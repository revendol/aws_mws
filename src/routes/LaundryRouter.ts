import { Router } from 'express';
import LaundryController from "@controllers/LaundryController";

const router = Router();

export const p = {
  basePath: '/laundry',
  saveLaundryDataToDatabase: '/saveLaundryDataToDatabase'
} as const;

router.get(
  p.saveLaundryDataToDatabase,
  (req, res) =>
    LaundryController.saveLaundryDataToDatabase(req, res)
);

export default router;
