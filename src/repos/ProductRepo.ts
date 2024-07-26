import axios from 'axios';
import xml2js from 'xml2js';
import envVars from '@shared/env-vars';
import { google } from "googleapis";
//PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDAQBkKfSTuqNBS\nRkT/aMlC96xGnDVmeAX34g2Q5OjnlH/0p5ZpMeulJAIOGNnz4r04oAIwS1ECctcx\nVM4GOPSPhG0bpBXVT9g6Cu5NSvLkeAee9/kjDvkmv7lFa8pnGrMz4pofdRqB+F2U\naOVOxRuU99uAEVIu3emZL7Y8vQ5EJ7Oz03cWCmdnZXEMl6wYX1pgEplJwBAJExzj\nJUE/llPUF4rze6lazQvzWXmX2JZ2z1MYFz+f5fWskRnhPLTA2pvId8ldwjN7Sk1D\nZKwt6c94Mw0UEHk6wXLz2kC+o72ssWtG+PEzc4vTNwUntfM3ngrmIu2rRO5yq6Rm\nq7IOGDAfAgMBAAECggEAHaMD+Tj3k48UpkpM4q7Nr/Qsa6ozFTvVd7QycS7ItMKQ\nwy9+oXLfp9KYOoIcP1up3evUyoshzuXTRLiVFiJ7mRBKHaO69epcI/6BZAr0zMGw\nMxJ5Jq1tPUr7DbejOSfFjm8VYVoVHwohqvpMt0rtiJZ5ERIagD0XgNT5G/3tEBZm\nV5VzrTNt3xXKFzgziqYoHVC1eYVkOLKfs8Pok4BbLIS6vgHiWPBgjQeDuzsmHhDT\n6hXdmyYKQ6Ar+RX7EuK0pvHnij+bpnVWKJOmvI1qgEiqo5R/x9zFQ85DWVTE3VN1\nzDiAsnA8fenSeebN0Nvp6KdtGuDYtpHRrSMcIWsdkQKBgQDfvJUP3+cTa2RHQ9cB\nPrTHa7o1PQVH/C5kbDHeXmqskKhlB53dEtY9GXq2rLuuA0RNsLqtk/Chds6IGgwo\nhMmXQDwA4X07EeeOc3IAzzo/YLe05LUuTkQh4RSB2UIxZ9fnG9jbq91JxzhEwCDb\nJB45E4q2HyR5aMQTC7gs+MrrKQKBgQDb+Sy8O47Qdj+ekkqrb9U5v8vxKCZaIKLu\nLGnJaoj1t1ZVqq24i+erD+QqJ+34qbGjZQk2hZgyl/aGSwEb739hfAgHUoHJWv5W\nKhVmuKkmlnOKwWG+tsHBDqD5kOxTIIfYdD7/8ToaDuA1TOsthYGf4/F+DuCWgD/k\nskZfIyfyBwKBgQCtU7ga4zdtuO2ns+uVwFFmiJNp+QrlWH1MOPFtNrHnW+3IztzC\nTnyAOwPxDuIajddVZItKO2jYfWTE1YEDxtMxhIa3m/hbUaSUm+T+sYuLW88VqXSf\nGez4Xhl3+qqoAa2mEdGvZHZ7WIXD5R/PBS0QxI3aR0gHcl0r8BFPbbIt+QKBgQCb\n9kUziH6vasecpFhwyK/DbCsq5q6ahD1A5Rh0CCbnIIAD6SmWiQtOi8vX38un3Jjo\nIoCvuXS5mmjdulwk9F+6PHhsyKDgpLVjXh8iX5b+lvmAza+Byo4BVV/o0kncfloS\nrAjm6p+pThbFc63i7p+DP9g+6kluK6wheAzQ81olDQKBgFFyvEz0KDt9b8IQk/1t\nqNIQxTm30jsdwAxAh8TpXbEquNZRjDWwpKN5lCT3WsgnXx/gi32syLu8XDkvlbDY\noipkAOR9VnY5WSVVKJWsI2TAnTJ6S7UvxrZpaHhH0+J6GeBHDvxbyPNxzTU/S1Gr\nXU/9GGW4/ErsS5Pe19hYUEWy\n-----END PRIVATE KEY-----\n"
//CLIENT_EMAIL = "awsmws@awsmws-430606.iam.gserviceaccount.com"
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
    public async allProducts(): Promise<any> {
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
        const range = "Sheet1!A5:P"; 
        
        const response = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = response.data.values;
        if (rows?.length) {
            return rows;
        } else {
            console.log('No data found.');
            return [];
        }
    }
}

export default new ProductRepo();
