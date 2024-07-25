import { Request, Response } from "express";
import ProductRepo from "@repos/ProductRepo";
import {success} from "@shared/response";
import ErrorMessage from "@shared/errorMessage";
import StatusCode from "http-status-codes";
const {OK, INTERNAL_SERVER_ERROR} = StatusCode;
import { paginate } from "@util/paginate";
class ProductController {

}

export default new ProductController();
