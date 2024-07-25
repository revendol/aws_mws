import { Router } from 'express';
import ProductController from "@controllers/productController";

const router = Router();

export const p = {
  basePath: '/product',
} as const;

export default router;
