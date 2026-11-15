
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderFeature } from './order.feature.js';
import type { PlaceOrderParam } from './order.feature.js';
import { Status, StatusCode } from '../../entities/status/index.js';
import { OrderStatus } from '../../entities/order/OrderStatus.js';
import type { IdGeneratorInterface } from '../../services/idgen.service.js';
import type {
  OrderRepositoryInterface,
  ProductRepositoryInterface,
} from '../../repositories/repository.js';

type GetProductResult = Awaited<
  ReturnType<ProductRepositoryInterface['getProduct']>
>;

type CreateOrderResult = Awaited<
  ReturnType<OrderRepositoryInterface['createOrder']>
>;

type GenerateIdsResult = ReturnType<
  IdGeneratorInterface['generateIds']
>;

describe('OrderFeature', () => {
  let feature: OrderFeature;

  let idGenerator: {
    generateIds: ReturnType<typeof vi.fn<IdGeneratorInterface['generateIds']>>;
  };

  let orderRepo: {
    createOrder: ReturnType<typeof vi.fn<OrderRepositoryInterface['createOrder']>>;
  };

  let productRepo: {
    getProduct: ReturnType<typeof vi.fn<ProductRepositoryInterface['getProduct']>>;
  };

  const validParam: PlaceOrderParam = {
    idempotency_key: 'idempotency-key-123',
    name: 'John Doe',
    email: 'customer@example.com',
    item_id: 'product-123',
    quantity: '1',
  };

  const product = {
    unique_id: 'product-123',
    name: 'Product Name',
    description: 'Product Description',
    selling_price: 10000,
    created_at: new Date()
  };

  const createProductResult = (
    result: Partial<GetProductResult>,
  ): GetProductResult => result as GetProductResult;

  const createOrderResult = (
    result: Partial<CreateOrderResult>,
  ): CreateOrderResult => result as CreateOrderResult;

  const createGenerateIdsResult = (
    result: Partial<GenerateIdsResult>,
  ): GenerateIdsResult => result as GenerateIdsResult;

  const generatedIds = [
    { text: 'order-123', binary: Buffer.from('order-123') },
    { text: 'line-123', binary: Buffer.from('line-123') },
  ];

  const mockProductFound = () => {
    productRepo.getProduct.mockResolvedValue(
      createProductResult({
        status: new Status(StatusCode.SUCCESS, 'success'),
        product,
      }),
    );
  };

  const mockIdsGenerated = () => {
    idGenerator.generateIds.mockReturnValue(
      createGenerateIdsResult({
        status: new Status(StatusCode.SUCCESS, 'success'),
        ids: generatedIds,
      }),
    );
  };

  const mockOrderCreated = (
    exists = false,
    uniqueId = 'order-123',
  ) => {
    orderRepo.createOrder.mockResolvedValue(
      createOrderResult({
        status: new Status(StatusCode.SUCCESS, 'success'),
        order: {
          exists,
          unique_id: uniqueId,
        },
      }),
    );
  };

  beforeEach(() => {
    idGenerator = {
      generateIds: vi.fn<IdGeneratorInterface['generateIds']>(),
    };

    orderRepo = {
      createOrder: vi.fn<OrderRepositoryInterface['createOrder']>(),
    };

    productRepo = {
      getProduct: vi.fn<ProductRepositoryInterface['getProduct']>(),
    };

    feature = new OrderFeature(
      idGenerator as unknown as IdGeneratorInterface,
      orderRepo as unknown as OrderRepositoryInterface,
      productRepo as unknown as ProductRepositoryInterface,
    );
  });

  describe('placeOrder', () => {
    describe('when request parameters are invalid', () => {
      it.each([
        {
          description: 'idempotency key is missing',
          param: { ...validParam, idempotency_key: undefined },
        },
        {
          description: 'idempotency key is empty',
          param: { ...validParam, idempotency_key: ' ' },
        },
        {
          description: 'idempotency key exceeds maximum length',
          param: { ...validParam, idempotency_key: 'a'.repeat(37) },
        },
        {
          description: 'name is missing',
          param: { ...validParam, name: undefined },
        },
        {
          description: 'name is empty',
          param: { ...validParam, name: ' ' },
        },
        {
          description: 'name exceeds maximum length',
          param: { ...validParam, name: 'a'.repeat(129) },
        },
        {
          description: 'email is invalid',
          param: { ...validParam, email: 'invalid-email' },
        },
        {
          description: 'email exceeds maximum length',
          param: {
            ...validParam,
            email: `${'a'.repeat(180)}@example.com`,
          },
        },
        {
          description: 'item ID is missing',
          param: { ...validParam, item_id: undefined },
        },
        {
          description: 'item ID is empty',
          param: { ...validParam, item_id: ' ' },
        },
        {
          description: 'item ID exceeds maximum length',
          param: { ...validParam, item_id: 'a'.repeat(65) },
        },
        {
          description: 'quantity is zero',
          param: { ...validParam, quantity: '0' },
        },
        {
          description: 'quantity exceeds maximum allowed',
          param: { ...validParam, quantity: '2' },
        },
        {
          description: 'quantity is invalid',
          param: { ...validParam, quantity: 'invalid' },
        },
      ])('should return VALIDATION_INVALID_PARAM when $description', async ({ param }) => {
        const result = await feature.placeOrder(param);

        expect(result).toEqual({
          status: new Status(
            StatusCode.VALIDATION_INVALID_PARAM,
            'invalid parameter',
          ),
        });

        expect(productRepo.getProduct).not.toHaveBeenCalled();
        expect(idGenerator.generateIds).not.toHaveBeenCalled();
        expect(orderRepo.createOrder).not.toHaveBeenCalled();
      });
    });

    describe('when product lookup fails', () => {
      it('should return VALIDATION_INVALID_PARAM', async () => {
        productRepo.getProduct.mockResolvedValue(
          createProductResult({
            status: new Status(
              StatusCode.VALIDATION_INVALID_STATE,
              'product lookup failed',
            ),
          }),
        );

        const result = await feature.placeOrder(validParam);

        expect(productRepo.getProduct).toHaveBeenCalledExactlyOnceWith({
          unique_id: validParam.item_id,
        });

        expect(result).toEqual({
          status: new Status(
            StatusCode.VALIDATION_INVALID_PARAM,
            'product not found',
          ),
        });

        expect(idGenerator.generateIds).not.toHaveBeenCalled();
        expect(orderRepo.createOrder).not.toHaveBeenCalled();
      });
    });

    describe('when product does not exist', () => {
      it('should return VALIDATION_INVALID_PARAM', async () => {
        productRepo.getProduct.mockResolvedValue(
          createProductResult({
            status: new Status(StatusCode.SUCCESS, 'success'),
            product: undefined,
          }),
        );

        const result = await feature.placeOrder(validParam);

        expect(result).toEqual({
          status: new Status(
            StatusCode.VALIDATION_INVALID_PARAM,
            'product not found',
          ),
        });

        expect(idGenerator.generateIds).not.toHaveBeenCalled();
        expect(orderRepo.createOrder).not.toHaveBeenCalled();
      });
    });

    describe('when ID generation fails', () => {
      beforeEach(() => {
        mockProductFound();
      });

      it('should return VALIDATION_INVALID_PARAM when generation status is unsuccessful', async () => {
        idGenerator.generateIds.mockReturnValue(
          createGenerateIdsResult({
            status: new Status(
              StatusCode.VALIDATION_INVALID_STATE,
              'ID generation failed',
            ),
          }),
        );

        const result = await feature.placeOrder(validParam);

        expect(idGenerator.generateIds).toHaveBeenCalledExactlyOnceWith(2);

        expect(result).toEqual({
          status: new Status(
            StatusCode.VALIDATION_INVALID_PARAM,
            'failed generate id',
          ),
        });

        expect(orderRepo.createOrder).not.toHaveBeenCalled();
      });

      it('should return VALIDATION_INVALID_PARAM when generated IDs are missing', async () => {
        idGenerator.generateIds.mockReturnValue(
          createGenerateIdsResult({
            status: new Status(StatusCode.SUCCESS, 'success'),
            ids: undefined,
          }),
        );

        const result = await feature.placeOrder(validParam);

        expect(result).toEqual({
          status: new Status(
            StatusCode.VALIDATION_INVALID_PARAM,
            'failed generate id',
          ),
        });

        expect(orderRepo.createOrder).not.toHaveBeenCalled();
      });

      it('should not generate IDs when product lookup fails', async () => {
        productRepo.getProduct.mockResolvedValue(
          createProductResult({
            status: new Status(
              StatusCode.VALIDATION_INVALID_STATE,
              'product lookup failed',
            ),
          }),
        );

        await feature.placeOrder(validParam);

        expect(idGenerator.generateIds).not.toHaveBeenCalled();
      });
    });

    describe('when order is successfully created', () => {
      beforeEach(() => {
        mockProductFound();
        mockIdsGenerated();
        mockOrderCreated();
      });

      it('should generate two IDs', async () => {
        await feature.placeOrder(validParam);

        expect(idGenerator.generateIds).toHaveBeenCalledExactlyOnceWith(2);
      });

      it('should create an order with the correct parameters', async () => {
        await feature.placeOrder(validParam);

        expect(orderRepo.createOrder).toHaveBeenCalledExactlyOnceWith(
          expect.objectContaining({
            idempotency_key: validParam.idempotency_key,
            unique_id: 'order-123',
            buyer_email: 'customer@example.com',
            buyer_name: 'John Doe',
            status: OrderStatus.PENDING,
            grand_total: product.selling_price,
            item: {
              unique_id: 'line-123',
              name: product.name,
              description: product.description,
              product_id: product.unique_id,
              quantity: 1,
              unit_price: product.selling_price,
            },
          }),
        );
      });

      it('should use the same timestamp for placed_at and created_at', async () => {
        await feature.placeOrder(validParam);

        const createParam = orderRepo.createOrder.mock.calls[0][0];

        expect(createParam.placed_at).toBeInstanceOf(Date);
        expect(createParam.created_at).toBeInstanceOf(Date);
        expect(createParam.placed_at).toBe(createParam.created_at);
      });

      it('should return SUCCESS with the created order', async () => {
        const result = await feature.placeOrder(validParam);

        expect(result).toEqual({
          status: new Status(
            StatusCode.SUCCESS,
            'success place order',
          ),
          order: {
            exists: false,
            unique_id: 'order-123',
          },
        });
      });
    });

    describe('when the email contains uppercase characters', () => {
      it('should normalize the email to lowercase', async () => {
        mockProductFound();
        mockIdsGenerated();
        mockOrderCreated();

        await feature.placeOrder({
          ...validParam,
          email: 'CUSTOMER@EXAMPLE.COM',
        });

        expect(orderRepo.createOrder).toHaveBeenCalledWith(
          expect.objectContaining({
            buyer_email: 'customer@example.com',
          }),
        );
      });
    });

    describe('when the order already exists', () => {
      it('should return the existing order', async () => {
        mockProductFound();
        mockIdsGenerated();
        mockOrderCreated(true, 'existing-order-123');

        const result = await feature.placeOrder(validParam);

        expect(result).toEqual({
          status: new Status(
            StatusCode.SUCCESS,
            'success place order',
          ),
          order: {
            exists: true,
            unique_id: 'existing-order-123',
          },
        });
      });
    });

    describe('when order creation fails', () => {
      it('should return the repository status', async () => {
        const status = new Status(
          StatusCode.VALIDATION_INVALID_STATE,
          'unable to create order',
        );

        mockProductFound();
        mockIdsGenerated();

        orderRepo.createOrder.mockResolvedValue(
          createOrderResult({
            status,
            order: undefined,
          }),
        );

        const result = await feature.placeOrder(validParam);

        expect(result).toEqual({ status });
        expect(result.order).toBeUndefined();
      });

      it('should return the repository status when order is missing despite SUCCESS', async () => {
        const status = new Status(StatusCode.SUCCESS, 'success');

        mockProductFound();
        mockIdsGenerated();

        orderRepo.createOrder.mockResolvedValue(
          createOrderResult({
            status,
            order: undefined,
          }),
        );

        const result = await feature.placeOrder(validParam);

        expect(result).toEqual({ status });
        expect(result.order).toBeUndefined();
      });
    });

    describe('when an unexpected exception occurs', () => {
      it('should handle product repository exceptions', async () => {
        const error = new Error('Product database unavailable');

        productRepo.getProduct.mockRejectedValue(error);

        const result = await feature.placeOrder(validParam);

        expect(result).toEqual({
          status: Status.fromError(error),
        });

        expect(idGenerator.generateIds).not.toHaveBeenCalled();
        expect(orderRepo.createOrder).not.toHaveBeenCalled();
      });

      it('should handle ID generator exceptions', async () => {
        const error = new Error('ID generation failed');

        mockProductFound();

        idGenerator.generateIds.mockImplementation(() => {
          throw error;
        });

        const result = await feature.placeOrder(validParam);

        expect(result).toEqual({
          status: Status.fromError(error),
        });

        expect(orderRepo.createOrder).not.toHaveBeenCalled();
      });

      it('should handle order repository exceptions', async () => {
        const error = new Error('Database insert failed');

        mockProductFound();
        mockIdsGenerated();

        orderRepo.createOrder.mockRejectedValue(error);

        const result = await feature.placeOrder(validParam);

        expect(result).toEqual({
          status: Status.fromError(error),
        });
      });
    });
  });
});
