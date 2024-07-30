import Service from "@services/Service";
import ProductRepo from "@repos/ProductRepo";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import { FeedsApiClient } from "@scaleleap/selling-partner-api-sdk";
import envVars from '@shared/env-vars';

class ProductService extends Service {
    private stsClient;
    constructor() {
        super(ProductRepo);
        this.stsClient = new STSClient({
            credentials: {
                accessKeyId: envVars.FBAData.AWS_ACCESS_KEY_ID,
                secretAccessKey: envVars.FBAData.AWS_SECRET_ACCESS_KEY,
            },
            region: '',
        });
    }

    async getAwsCredentials() {
        const { Credentials } = await this.stsClient.send(
            new AssumeRoleCommand({
                RoleArn: '',
                RoleSessionName: 'selling-partner-api-session',
            })
        );
        return Credentials;
    }

    public async allFeeds() {
        try {
            const awsCredentials = await this.getAwsCredentials();
            const client = new FeedsApiClient({
                accessToken: 'A2JC975ZK0FJSB',
                basePath: 'https://sellingpartnerapi-na.amazon.com',
                region: 'us-east-1',
                credentials: {
                    accessKeyId: envVars.FBAData.AWS_ACCESS_KEY_ID,
                    secretAccessKey: envVars.FBAData.AWS_SECRET_ACCESS_KEY,
                    sessionToken: envVars.FBAData.MWS_AUTH_TOKEN,
                },
            });

            const response = await client.getFeeds({});
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