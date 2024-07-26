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
            const product = await ProductRepo.addProduct(data);
            return product;
        } catch (error) {
            throw new Error('Error adding Product');
        }
    }
    public async allProducts() {
    return ProductRepo.allProducts();
    }
}

export default new ProductService();