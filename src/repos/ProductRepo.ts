import axios from 'axios';
import xml2js from 'xml2js';
import envVars from '@shared/env-vars';

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
}

export default new ProductRepo();
