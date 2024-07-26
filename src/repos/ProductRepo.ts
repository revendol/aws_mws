import axios from 'axios';
import xml2js from 'xml2js';
import envVars from '@shared/env-vars';
import { google } from "googleapis";
interface Product {
    [key: string]: string | null;
}
class ProductRepo {
    public async addProduct(data: any): Promise<any> {
        const feedContent = {
            AmazonEnvelope: {
                Header: {
                    DocumentVersion: '1.01',
                    MerchantIdentifier: envVars.FBAData.SELLER_ID,
                },
                MessageType: 'Product',
                Message: [
                    {
                        MessageID: '1',
                        OperationType: 'Update',
                        Product: {
                            SKU: data.SKU,
                            StandardProductID: {
                                Type: data.StandardProductID.Type,
                                Value: data.StandardProductID.Value,
                            },
                            ProductTaxCode: data.ProductTaxCode,
                            DescriptionData: {
                                Title: data.DescriptionData.Title,
                                Brand: data.DescriptionData.Brand,
                                Description: data.DescriptionData.Description,
                                BulletPoint: data.DescriptionData.BulletPoint,
                                Manufacturer: data.DescriptionData.Manufacturer,
                                MfrPartNumber: data.DescriptionData.MfrPartNumber,
                                ItemType: data.DescriptionData.ItemType,
                            },
                            ProductData: {
                                AutoAccessory: {
                                    ProductType: {
                                        AutoPart: {},
                                    },
                                    ProductSubtype: data.ProductData.ProductSubtype,
                                },
                            },
                        },
                    },
                ],
            },
        };

        const builder = new xml2js.Builder();
        const xml = builder.buildObject(feedContent);

        const params = {
            AWSAccessKeyId: envVars.FBAData.AWS_ACCESS_KEY_ID,
            Action: 'SubmitFeed',
            FeedType: '_POST_PRODUCT_DATA_',
            MWSAuthToken: envVars.FBAData.MWS_AUTH_TOKEN,
            SellerId: envVars.FBAData.SELLER_ID,
            SignatureMethod: 'HmacSHA256',
            SignatureVersion: '2',
            Timestamp: new Date().toISOString(),
            Version: '2009-01-01',
        };

        const mwsEndpoint = 'https://mws.amazonservices.com/';

        try {
            const response = await axios.post(mwsEndpoint, xml, {
                params,
                headers: {
                    'Content-Type': 'text/xml',
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error submitting feed to Amazon MWS');
        }
    }
    public async allProducts(): Promise<Product[]> {
        const client_email = envVars.googleSheets.clientEmail;
        const private_key = envVars.googleSheets.privateKey;

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: client_email,
                private_key: private_key,
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const authClient = await auth.getClient();
        const googleSheets = google.sheets({ version: 'v4', auth: auth });

        const spreadsheetId = "1d5xURe9YW4pJDAm6E-dpUVvNUO9F3PQEAXD-FIirM28";
        
        const titleResponse = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Sheet1!A4:P4",
        });

        const headers: string[] | undefined = titleResponse.data.values ? titleResponse.data.values[0] : undefined;
        if (!headers) {
            console.log('No header data found.');
            return [];
        }

        // Get the data rows (A5:P)
        const dataResponse = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Sheet1!A5:P",
        });

        const rows: string[][] | undefined = dataResponse.data.values as string[][] | undefined;
        if (rows?.length) {
            return rows.map((row: string[]) => {
                const rowObject: Product = {};
                headers.forEach((header: string, index: number) => {
                    rowObject[header] = row[index] || null;
                });
                return rowObject;
            });
        } else {
            console.log('No data found.');
            return [];
        }
    }
}

export default new ProductRepo();
