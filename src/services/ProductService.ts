import Service from "@services/Service";
import ProductRepo from "@repos/ProductRepo";
import path from "path";
import fs from "fs";
//import amazonMws from "amazon-mws";
import envVars from '@shared/env-vars';
import axios from "axios";
import crypto from 'crypto';
interface MwsParams {
    Version: string;
    Action: string;
    SellerId: string;
    MWSAuthToken: string;
    MaxCount: number;
    Timestamp: string;
    SignatureMethod: string;
    SignatureVersion: string;
    AWSAccessKeyId: string;
    [key: string]: any; // Allows additional properties like 'Signature'
}

class ProductService extends Service {
    constructor() {
        super(ProductRepo);
    }
    private endpoint = 'https://mws.amazonservices.com/';
    private version = '2009-01-01';
    private action = 'GetFeedSubmissionList';
    private signRequest(params: MwsParams): string {
        const secretKey = envVars.FBAData.AWS_SECRET_ACCESS_KEY;
        const sortedParams = Object.keys(params)
            .filter(key => key !== 'Signature') // Exclude 'Signature' from sorting
            .sort()
            .reduce((result: any, key: string) => {
                result[key] = params[key];
                return result;
            }, {});

        const queryString = Object.keys(sortedParams)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(sortedParams[key])}`)
            .join('&');

        const stringToSign = `GET\nmws.amazonservices.com\n/\n${queryString}`;
        return crypto.createHmac('sha256', secretKey).update(stringToSign).digest('base64');
    }
    public async allFeeds() {
        const params: MwsParams = {
            Version: this.version,
            Action: this.action,
            SellerId: envVars.FBAData.SELLER_ID,
            MWSAuthToken: envVars.FBAData.MWS_AUTH_TOKEN,
            MaxCount: 10,
            Timestamp: new Date().toISOString(),
            SignatureMethod: 'HmacSHA256',
            SignatureVersion: '2',
            AWSAccessKeyId: envVars.FBAData.AWS_ACCESS_KEY_ID,
        };
        params.Signature = this.signRequest(params);

        try {
            const response = await axios.get(this.endpoint, { params });
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching feed submissions: ${error.message}`);
        }
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