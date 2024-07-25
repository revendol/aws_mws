import { Router } from 'express';
import InventoryController from "@controllers/InventoryController";

const router = Router();

export const p = {
  basePath: '/inventory',
  all: '/all',
  update: '/update/:id',
  checkData: '/check-data',
  checkCalculationOfUsage: '/calculationOfUsage'
} as const;

//to check manyally
router.get(
  p.checkCalculationOfUsage,
  (req, res) =>
    InventoryController.checkCalculationOfUsage(req, res)
);

router.get(
  p.all,
  (req, res) =>
    InventoryController.getInventory(req, res)
);

router.post(
  p.update,
  (req, res) =>
    InventoryController.updateInventory(req, res)
);

// router.get(
//   p.checkData,
//   (req, res) =>
//     InventoryController.checkData(req, res)
// );

export default router;
