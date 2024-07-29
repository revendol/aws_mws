import { Router } from 'express';
import ProductController from "@controllers/ProductController";

const router = Router();

export const p = {
  basePath: '/product',
  createProduct: '/createProduct',
  getProducts: '/getProducts',
  getFeeds: '/getFeeds',
} as const;

router.get(
  p.getFeeds,
  (req, res) =>
    ProductController.getFeeds(req, res)
);

router.post(
  p.createProduct,
  (req, res) =>
    ProductController.createProduct(req, res)
);

router.get(
  p.getProducts,
  (req, res) =>
    ProductController.getProducts(req, res)
);


export default router;
