import { Request, Response } from "express";
import ProductRepo from "@repos/ProductRepo";
import {success} from "@shared/response";
import ErrorMessage from "@shared/errorMessage";
import ProductService from "@services/ProductService";

import StatusCode from "http-status-codes";
const {OK, INTERNAL_SERVER_ERROR} = StatusCode;
import { paginate } from "@util/paginate";
class ProductController {
    async createProduct(req: Request, res: Response) {
        try {
          const { data } = req.body;
          await ProductService.addProduct(data);
          res.status(200).send("Data Added Successfully.");
      } catch (error) {
        res.status(500).send("Error Adding Data");
      }
    }
    async getProducts(req: Request, res: Response) {
      const { page, size, type }: any = req.query;
      let data: any = await ProductService.allProducts();
      res.status(OK).json(data);
    }      
}

export default new ProductController();
