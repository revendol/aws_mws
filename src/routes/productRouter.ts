import { Router } from 'express';
import ProductController from "@controllers/ProductController";

const router = Router();

export const p = {
  basePath: '/product',
  createProduct: '/createProduct',
} as const;

router.post(
  p.createProduct,
  (req, res) =>
    ProductController.createProduct(req, res)
);

export default router;
