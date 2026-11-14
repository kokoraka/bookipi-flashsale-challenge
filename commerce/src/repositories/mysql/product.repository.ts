
import {
  ProductRepositoryInterface,
  GetProductParam,
  GetProductResult,
} from '../repository.js';
import { Status } from './../../entities/status/Status.js';
import { StatusCode } from './../../entities/status/StatusCode.js';

export class ProductRepository implements ProductRepositoryInterface {

  async getProduct(p: GetProductParam): Promise<GetProductResult> {
    try {

      return {
        status: new Status(
          StatusCode.SUCCESS,
          'Product retrieved successfully',
        ),
        product: {
          unique_id: "930ea41d-93e4-4fff-83f7-78681ad49dbe",
          name: "Product 1",
          description: "Description of Product 1",
          selling_price: 499.99,
          thumbnail: {
            provider: "",
            file: {
              public_url: "https://learn.kotoenglish.com/wp-content/uploads/2025/05/Banana-Definition.webp",
            }
          },
          created_at: new Date(1794531600000),
        }
      };
    } catch (e: unknown) {
      return {
        status: Status.fromError(e),
      };
    }
  }
}
