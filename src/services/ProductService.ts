import Service from "@services/Service";
import ProductRepo from "@repos/ProductRepo";
import path from "path";
import fs from "fs";
class ProductService extends Service {
    constructor() {
        super(ProductRepo);
    }
    public async addProduct(data: any) {
        try {
            const customer = await ProductRepo.addProduct(data);
            return customer;
        } catch (error) {
            throw new Error('Error adding industry navigation');
        }
    }
}

export default new ProductService();