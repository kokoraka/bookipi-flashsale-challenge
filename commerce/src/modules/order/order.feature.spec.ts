
import { describe, it as It, expect, vi, beforeEach, afterEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { OrderFeature } from './order.feature.js';
import { Status, StatusCode } from '../../entities/status/index.js';
import { OrderStatus } from '../../entities/order/OrderStatus.js';
import type { IdGeneratorInterface } from '../../services/idgen.service.js';
import type {
  OrderRepositoryInterface,
  ProductRepositoryInterface,
  PromotionRepositoryInterface,
} from '../../repositories/repository.js';
import {
  ReserveStockCode,
  type InventoryServiceInterface,
} from '../../services/inventory.service.js';

describe('OrderFeature', () => {
  let feature: OrderFeature;

  let idGenerator: {
    generateIds: ReturnType<typeof vi.fn>;
  };

  let orderRepo: {
    getOrder: ReturnType<typeof vi.fn>;
    createOrder: ReturnType<typeof vi.fn>;
  };

  let productRepo: {
    getProduct: ReturnType<typeof vi.fn>;
  };

  let promotionRepo: {
    getPromotion: ReturnType<typeof vi.fn>;
  };

  let inventoryService: {
    reserveStock: ReturnType<typeof vi.fn>;
  };

  let eventClient: {
    emit: ReturnType<typeof vi.fn>;
  };

  const validParam = {
    idempotency_key: 'idempotency-key-001',
    promotion_id: 'promotion-001',
    name: 'John Doe',
    email: 'john@example.com',
    item_id: 'product-001',
    quantity: '1',
  };

  const validCreateParam = {
    idempotency_key: 'idempotency-key-001',
    promotion_key: 'promotion-001',
    order_id: 'order-001',
    buyer_email: 'john@example.com',
    buyer_name: 'John Doe',
    item_id: 'product-001',
    item_quantity: 1,
    item_name: 'Product Name',
    item_description: 'Product description',
    item_unit_price: 100_000,
    placed_at: new Date('2026-11-17T03:00:00.000Z'),
  };

  const orderId = 'order-001';
  const itemId = 'item-001';

  const createStatus = (code: StatusCode) =>
    new Status(code, 'test status');

  const createPromotion = (overrides = {}) => ({
    is_enabled: true,
    start_at: new Date(Date.now() - 60_000),
    end_at: new Date(Date.now() + 60_000),
    ...overrides,
  });

  const mockSuccessfulPromotion = () => {
    promotionRepo.getPromotion.mockResolvedValue({
      status: createStatus(StatusCode.SUCCESS),
      promotion: createPromotion(),
    });
  };

  const mockSuccessfulProduct = () => {
    productRepo.getProduct.mockResolvedValue({
      status: createStatus(StatusCode.SUCCESS),
      product: {
        name: 'Product Name',
        description: 'Product description',
        selling_price: 100_000,
      },
    });
  };

  const mockSuccessfulIdGeneration = (id = orderId) => {
    idGenerator.generateIds.mockReturnValue({
      status: createStatus(StatusCode.SUCCESS),
      ids: [{ text: id }],
    });
  };

  const mockSuccessfulReservation = () => {
    inventoryService.reserveStock.mockResolvedValue({
      code: ReserveStockCode.RESERVE_SUCCESS,
    });
  };

  const mockSuccessfulDependencies = () => {
    mockSuccessfulPromotion();
    mockSuccessfulProduct();
    mockSuccessfulIdGeneration();
    mockSuccessfulReservation();
  };

  const mockSuccessfulCreateDependencies = () => {
    mockSuccessfulProduct();
    mockSuccessfulIdGeneration(itemId);
  };

  const mockSuccessfulCreateOrder = () => {
    const createdAt = new Date();

    orderRepo.createOrder.mockResolvedValue({
      status: createStatus(StatusCode.SUCCESS),
      order: {
        unique_id: orderId,
        created_at: createdAt,
      },
    });

    return createdAt;
  };

  beforeEach(() => {
    idGenerator = {
      generateIds: vi.fn(),
    };

    orderRepo = {
      getOrder: vi.fn(),
      createOrder: vi.fn(),
    };

    productRepo = {
      getProduct: vi.fn(),
    };

    promotionRepo = {
      getPromotion: vi.fn(),
    };

    inventoryService = {
      reserveStock: vi.fn(),
    };

    eventClient = {
      emit: vi.fn().mockReturnValue(of(undefined)),
    };

    feature = new OrderFeature(
      idGenerator as unknown as IdGeneratorInterface,
      orderRepo as unknown as OrderRepositoryInterface,
      productRepo as unknown as ProductRepositoryInterface,
      promotionRepo as unknown as PromotionRepositoryInterface,
      inventoryService as unknown as InventoryServiceInterface,
      eventClient as unknown as ClientProxy,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('placeOrder', () => {
    describe('When validating parameters', () => {
      It('should return validation error when parameters are invalid', async () => {
        const result = await feature.placeOrder({
          ...validParam,
          email: 'invalid-email',
        });

        expect(result.status.is(StatusCode.VALIDATION_INVALID_PARAM)).toBe(true);

        expect(promotionRepo.getPromotion).not.toHaveBeenCalled();
        expect(productRepo.getProduct).not.toHaveBeenCalled();
        expect(idGenerator.generateIds).not.toHaveBeenCalled();
        expect(inventoryService.reserveStock).not.toHaveBeenCalled();
        expect(eventClient.emit).not.toHaveBeenCalled();
      });

      It('should return validation error when required parameters are missing', async () => {
        const result = await feature.placeOrder({
          name: 'John Doe',
          email: 'john@example.com',
        });

        expect(result.status.is(StatusCode.VALIDATION_INVALID_PARAM)).toBe(true);
      });

      It('should return validation error when quantity exceeds the limit', async () => {
        const result = await feature.placeOrder({
          ...validParam,
          quantity: '2',
        });

        expect(result.status.is(StatusCode.VALIDATION_INVALID_PARAM)).toBe(true);
      });

      It('should return validation error when quantity is zero', async () => {
        const result = await feature.placeOrder({
          ...validParam,
          quantity: '0',
        });

        expect(result.status.is(StatusCode.VALIDATION_INVALID_PARAM)).toBe(true);
      });
    });

    describe('When retrieving promotion', () => {
      It('should return validation error when promotion is not found', async () => {
        promotionRepo.getPromotion.mockResolvedValue({
          status: createStatus(StatusCode.SUCCESS),
          promotion: undefined,
        });

        const result = await feature.placeOrder(validParam);

        expect(result.status.is(StatusCode.VALIDATION_INVALID_PARAM)).toBe(true);
        expect(result.status.message).toBe('promotion not found');

        expect(productRepo.getProduct).not.toHaveBeenCalled();
      });

      It('should return validation error when promotion repository fails', async () => {
        promotionRepo.getPromotion.mockResolvedValue({
          status: createStatus(StatusCode.VALIDATION_INVALID_PARAM),
          promotion: undefined,
        });

        const result = await feature.placeOrder(validParam);

        expect(result.status.is(StatusCode.VALIDATION_INVALID_PARAM)).toBe(true);
        expect(result.status.message).toBe('promotion not found');
      });

      It('should return invalid state when promotion is not ongoing', async () => {
        promotionRepo.getPromotion.mockResolvedValue({
          status: createStatus(StatusCode.SUCCESS),
          promotion: createPromotion({
            start_at: new Date(Date.now() + 60_000),
            end_at: new Date(Date.now() + 120_000),
          }),
        });

        const result = await feature.placeOrder(validParam);

        expect(result.status.is(StatusCode.VALIDATION_INVALID_STATE)).toBe(true);
        expect(productRepo.getProduct).not.toHaveBeenCalled();
      });

      It('should return invalid state when promotion is disabled', async () => {
        promotionRepo.getPromotion.mockResolvedValue({
          status: createStatus(StatusCode.SUCCESS),
          promotion: createPromotion({
            is_enabled: false,
          }),
        });

        const result = await feature.placeOrder(validParam);

        expect(result.status.is(StatusCode.VALIDATION_INVALID_STATE)).toBe(true);
        expect(productRepo.getProduct).not.toHaveBeenCalled();
      });

      It('should retrieve promotion using the provided promotion ID', async () => {
        mockSuccessfulDependencies();

        await feature.placeOrder(validParam);

        expect(promotionRepo.getPromotion).toHaveBeenCalledWith({
          unique_id: validParam.promotion_id,
        });
      });
    });

    describe('When retrieving product', () => {
      beforeEach(() => {
        mockSuccessfulPromotion();
      });

      It('should return validation error when product is not found', async () => {
        productRepo.getProduct.mockResolvedValue({
          status: createStatus(StatusCode.SUCCESS),
          product: undefined,
        });

        const result = await feature.placeOrder(validParam);

        expect(result.status.is(StatusCode.VALIDATION_INVALID_PARAM)).toBe(true);
        expect(result.status.message).toBe('product not found');
        expect(idGenerator.generateIds).not.toHaveBeenCalled();
      });

      It('should return validation error when product repository fails', async () => {
        productRepo.getProduct.mockResolvedValue({
          status: createStatus(StatusCode.VALIDATION_INVALID_PARAM),
          product: undefined,
        });

        const result = await feature.placeOrder(validParam);

        expect(result.status.is(StatusCode.VALIDATION_INVALID_PARAM)).toBe(true);
        expect(result.status.message).toBe('product not found');
      });

      It('should retrieve product using the provided item ID', async () => {
        mockSuccessfulProduct();
        mockSuccessfulIdGeneration();
        mockSuccessfulReservation();

        await feature.placeOrder(validParam);

        expect(productRepo.getProduct).toHaveBeenCalledWith(
          {
            unique_id: validParam.item_id,
          },
          {
            readCache: true,
          },
        );
      });
    });

    describe('When generating order ID', () => {
      beforeEach(() => {
        mockSuccessfulPromotion();
        mockSuccessfulProduct();
      });

      It('should return validation error when ID generation fails', async () => {
        idGenerator.generateIds.mockReturnValue({
          status: createStatus(StatusCode.VALIDATION_INVALID_PARAM),
          ids: undefined,
        });

        const result = await feature.placeOrder(validParam);

        expect(result.status.is(StatusCode.VALIDATION_INVALID_PARAM)).toBe(true);
        expect(result.status.message).toBe('failed generate id');
        expect(inventoryService.reserveStock).not.toHaveBeenCalled();
      });

      It('should generate one order ID', async () => {
        mockSuccessfulIdGeneration();
        mockSuccessfulReservation();

        await feature.placeOrder(validParam);

        expect(idGenerator.generateIds).toHaveBeenCalledWith(1);
      });
    });

    describe('When reserving inventory', () => {
      beforeEach(() => {
        mockSuccessfulPromotion();
        mockSuccessfulProduct();
        mockSuccessfulIdGeneration();
      });

      It('should return invalid state when stock is insufficient', async () => {
        inventoryService.reserveStock.mockResolvedValue({
          code: ReserveStockCode.RESERVE_OUT_OF_STOCK,
        });

        const result = await feature.placeOrder(validParam);

        expect(result.status.is(StatusCode.VALIDATION_INVALID_STATE)).toBe(true);
        expect(result.status.message).toBe('insufficient product stock');
        expect(eventClient.emit).not.toHaveBeenCalled();
      });

      It('should return invalid state when identifier limit is reached', async () => {
        inventoryService.reserveStock.mockResolvedValue({
          code: ReserveStockCode.RESERVE_LIMIT_REACHED,
        });

        const result = await feature.placeOrder(validParam);

        expect(result.status.is(StatusCode.VALIDATION_INVALID_STATE)).toBe(true);
        expect(result.status.message).toBe('unable to order more than 1');
        expect(eventClient.emit).not.toHaveBeenCalled();
      });

      It('should return invalid state when reservation fails', async () => {
        inventoryService.reserveStock.mockResolvedValue({
          code: 'UNKNOWN_ERROR',
        });

        const result = await feature.placeOrder(validParam);

        expect(result.status.is(StatusCode.VALIDATION_INVALID_STATE)).toBe(true);
        expect(result.status.message).toBe('unable to reserve order');
        expect(eventClient.emit).not.toHaveBeenCalled();
      });

      It('should reserve inventory using the correct parameters', async () => {
        mockSuccessfulReservation();

        await feature.placeOrder(validParam);

        expect(inventoryService.reserveStock).toHaveBeenCalledWith({
          inventory_key: 'inventory:product-001',
          identifier_key: 'order:product-001',
          identifier_id: 'john@example.com',
          identifier_limit: '1',
        });
      });
    });

    describe('When publishing order event', () => {
      beforeEach(() => {
        mockSuccessfulDependencies();
      });

      It('should publish order placed event', async () => {
        await feature.placeOrder(validParam);

        expect(eventClient.emit).toHaveBeenCalledOnce();
      });

      It('should return successful result after publishing event', async () => {
        const result = await feature.placeOrder(validParam);

        expect(result.status.is(StatusCode.SUCCESS)).toBe(true);
        expect(result.status.message).toBe('success place order');

        expect(result.order).toEqual({
          exists: false,
          unique_id: orderId,
        });
      });

      It('should return error when event publishing fails', async () => {
        eventClient.emit.mockReturnValue(
          throwError(() => new Error('event publishing failed')),
        );

        const result = await feature.placeOrder(validParam);

        expect(result.status.is(StatusCode.SUCCESS)).toBe(false);
        expect(eventClient.emit).toHaveBeenCalledTimes(1);
      });
    });

    describe('When an unexpected error occurs', () => {
      It('should return error when promotion repository throws', async () => {
        promotionRepo.getPromotion.mockRejectedValue(
          new Error('database connection failed'),
        );

        const result = await feature.placeOrder(validParam);

        expect(result.status.is(StatusCode.SUCCESS)).toBe(false);
      });

      It('should return error when product repository throws', async () => {
        mockSuccessfulPromotion();

        productRepo.getProduct.mockRejectedValue(
          new Error('database connection failed'),
        );

        const result = await feature.placeOrder(validParam);

        expect(result.status.is(StatusCode.SUCCESS)).toBe(false);
      });

      It('should return error when inventory service throws', async () => {
        mockSuccessfulPromotion();
        mockSuccessfulProduct();
        mockSuccessfulIdGeneration();

        inventoryService.reserveStock.mockRejectedValue(
          new Error('inventory service unavailable'),
        );

        const result = await feature.placeOrder(validParam);

        expect(result.status.is(StatusCode.SUCCESS)).toBe(false);
      });
    });
  });

  describe('getOrder', () => {
    const uniqueId = 'order-001';

    It('should retrieve order successfully', async () => {
      const expectedResult = {
        status: createStatus(StatusCode.SUCCESS),
        order: {
          unique_id: uniqueId,
          buyer_name: 'John Doe',
          buyer_email: 'john@example.com',
          status: 'placed',
          grand_total: 100_000,
          placed_at: new Date(),
          created_at: new Date(),
          items: [],
        },
      };

      orderRepo.getOrder.mockResolvedValue(expectedResult);

      const result = await feature.getOrder({
        unique_id: uniqueId,
      });

      expect(result).toBe(expectedResult);

      expect(orderRepo.getOrder).toHaveBeenCalledWith(
        {
          unique_id: uniqueId,
        },
        {
          readCache: true,
          writeCache: true,
          cachePrefix: 'order-detail',
        },
      );
    });

    It('should return repository result when order is not found', async () => {
      const expectedResult = {
        status: createStatus(StatusCode.VALIDATION_INVALID_PARAM),
        order: undefined,
      };

      orderRepo.getOrder.mockResolvedValue(expectedResult);

      const result = await feature.getOrder({
        unique_id: uniqueId,
      });

      expect(result).toBe(expectedResult);
    });

    It('should return error when repository throws', async () => {
      orderRepo.getOrder.mockRejectedValue(
        new Error('database connection failed'),
      );

      const result = await feature.getOrder({
        unique_id: uniqueId,
      });

      expect(result.status.is(StatusCode.SUCCESS)).toBe(false);
    });

    It('should pass the requested unique ID to repository', async () => {
      orderRepo.getOrder.mockResolvedValue({
        status: createStatus(StatusCode.SUCCESS),
      });

      await feature.getOrder({
        unique_id: uniqueId,
      });

      expect(orderRepo.getOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          unique_id: uniqueId,
        }),
        expect.any(Object),
      );
    });
  });

  describe('createOrder', () => {
    describe('When validating parameters', () => {
      It('should return validation error when parameters are invalid', async () => {
        const result = await feature.createOrder({
          ...validCreateParam,
          buyer_email: 'invalid-email',
        });

        expect(result.status.is(StatusCode.VALIDATION_INVALID_PARAM)).toBe(true);
        expect(result.status.message).toBe('invalid parameter');

        expect(productRepo.getProduct).not.toHaveBeenCalled();
        expect(idGenerator.generateIds).not.toHaveBeenCalled();
        expect(orderRepo.createOrder).not.toHaveBeenCalled();
      });

      It('should return validation error when required parameters are missing', async () => {
        const result = await feature.createOrder({
          idempotency_key: validCreateParam.idempotency_key,
          promotion_key: validCreateParam.promotion_key,
        } as never);

        expect(result.status.is(StatusCode.VALIDATION_INVALID_PARAM)).toBe(true);
        expect(productRepo.getProduct).not.toHaveBeenCalled();
      });

      It('should return validation error when item quantity exceeds the limit', async () => {
        const result = await feature.createOrder({
          ...validCreateParam,
          item_quantity: 2,
        });

        expect(result.status.is(StatusCode.VALIDATION_INVALID_PARAM)).toBe(true);
        expect(result.status.message).toBe('invalid parameter');
      });

      It('should return validation error when item quantity is zero', async () => {
        const result = await feature.createOrder({
          ...validCreateParam,
          item_quantity: 0,
        });

        expect(result.status.is(StatusCode.VALIDATION_INVALID_PARAM)).toBe(true);
      });

      It('should return validation error when placed_at is not a Date', async () => {
        const result = await feature.createOrder({
          ...validCreateParam,
          placed_at: '2026-11-17T03:00:00.000Z',
        } as never);

        expect(result.status.is(StatusCode.VALIDATION_INVALID_PARAM)).toBe(true);
      });

      It('should return validation error when item name is empty', async () => {
        const result = await feature.createOrder({
          ...validCreateParam,
          item_name: ' ',
        });

        expect(result.status.is(StatusCode.VALIDATION_INVALID_PARAM)).toBe(true);
      });

      It('should allow an empty item description', async () => {
        mockSuccessfulCreateDependencies();
        mockSuccessfulCreateOrder();

        const result = await feature.createOrder({
          ...validCreateParam,
          item_description: '',
        });

        expect(result.status.is(StatusCode.SUCCESS)).toBe(true);
      });
    });

    describe('When retrieving product', () => {
      It('should return validation error when product is not found', async () => {
        productRepo.getProduct.mockResolvedValue({
          status: createStatus(StatusCode.SUCCESS),
          product: undefined,
        });

        const result = await feature.createOrder(validCreateParam);

        expect(result.status.is(StatusCode.VALIDATION_INVALID_PARAM)).toBe(true);
        expect(result.status.message).toBe('product not found');

        expect(idGenerator.generateIds).not.toHaveBeenCalled();
        expect(orderRepo.createOrder).not.toHaveBeenCalled();
      });

      It('should return validation error when product repository fails', async () => {
        productRepo.getProduct.mockResolvedValue({
          status: createStatus(StatusCode.VALIDATION_INVALID_PARAM),
          product: undefined,
        });

        const result = await feature.createOrder(validCreateParam);

        expect(result.status.is(StatusCode.VALIDATION_INVALID_PARAM)).toBe(true);
        expect(result.status.message).toBe('product not found');
      });

      It('should retrieve product using the provided item ID', async () => {
        mockSuccessfulProduct();
        mockSuccessfulIdGeneration();
        mockSuccessfulCreateOrder();

        await feature.createOrder(validCreateParam);

        expect(productRepo.getProduct).toHaveBeenCalledWith({
          unique_id: validCreateParam.item_id,
        });
      });
    });

    describe('When generating item ID', () => {
      beforeEach(() => {
        mockSuccessfulProduct();
      });

      It('should return validation error when ID generation fails', async () => {
        idGenerator.generateIds.mockReturnValue({
          status: createStatus(StatusCode.VALIDATION_INVALID_PARAM),
          ids: undefined,
        });

        const result = await feature.createOrder(validCreateParam);

        expect(result.status.is(StatusCode.VALIDATION_INVALID_PARAM)).toBe(true);
        expect(result.status.message).toBe('failed generate id');

        expect(orderRepo.createOrder).not.toHaveBeenCalled();
      });

      It('should generate one item ID', async () => {
        mockSuccessfulIdGeneration();
        mockSuccessfulCreateOrder();

        await feature.createOrder(validCreateParam);

        expect(idGenerator.generateIds).toHaveBeenCalledWith(1);
      });
    });

    describe('When creating order in repository', () => {
      beforeEach(() => {
        mockSuccessfulCreateDependencies();
      });

      It('should create order with the correct parameters', async () => {
        mockSuccessfulCreateOrder();

        await feature.createOrder(validCreateParam);

        expect(orderRepo.createOrder).toHaveBeenCalledOnce();

        expect(orderRepo.createOrder).toHaveBeenCalledWith(
          expect.objectContaining({
            idempotency_key: validCreateParam.idempotency_key,
            unique_id: validCreateParam.order_id,
            promotion_key: validCreateParam.promotion_key,
            buyer_email: validCreateParam.buyer_email,
            buyer_name: validCreateParam.buyer_name,
            status: OrderStatus.PENDING,
            grand_total: validCreateParam.item_unit_price,
            item: {
              unique_id: itemId,
              name: validCreateParam.item_name,
              description: validCreateParam.item_description,
              product_id: validCreateParam.item_id,
              unit_price: validCreateParam.item_unit_price,
              quantity: validCreateParam.item_quantity,
            },
            placed_at: validCreateParam.placed_at,
            created_at: expect.any(Date),
          }),
        );
      });

      It('should use the generated ID for the order item', async () => {
        mockSuccessfulIdGeneration('generated-item-001');
        mockSuccessfulCreateOrder();

        await feature.createOrder(validCreateParam);

        expect(orderRepo.createOrder).toHaveBeenCalledWith(
          expect.objectContaining({
            item: expect.objectContaining({
              unique_id: 'generated-item-001',
            }),
          }),
        );
      });

      It('should return repository status when order creation fails', async () => {
        const repositoryStatus = createStatus(
          StatusCode.VALIDATION_INVALID_PARAM,
        );

        orderRepo.createOrder.mockResolvedValue({
          status: repositoryStatus,
          order: undefined,
        });

        const result = await feature.createOrder(validCreateParam);

        expect(result.status).toBe(repositoryStatus);
        expect(result.order).toBeUndefined();
      });

      It('should return repository status when created order is missing', async () => {
        const repositoryStatus = createStatus(StatusCode.SUCCESS);

        orderRepo.createOrder.mockResolvedValue({
          status: repositoryStatus,
          order: undefined,
        });

        const result = await feature.createOrder(validCreateParam);

        expect(result.status).toBe(repositoryStatus);
        expect(result.order).toBeUndefined();
      });

      It('should return successful result after creating order', async () => {
        const createdAt = mockSuccessfulCreateOrder();

        const result = await feature.createOrder(validCreateParam);

        expect(result.status.is(StatusCode.SUCCESS)).toBe(true);
        expect(result.status.message).toBe('success create order');

        expect(result.order).toEqual({
          unique_id: orderId,
          created_at: createdAt,
        });
      });

      It('should use the provided order ID as the repository unique ID', async () => {
        mockSuccessfulCreateOrder();

        await feature.createOrder({
          ...validCreateParam,
          order_id: 'custom-order-001',
        });

        expect(orderRepo.createOrder).toHaveBeenCalledWith(
          expect.objectContaining({
            unique_id: 'custom-order-001',
          }),
        );
      });
    });

    describe('When an unexpected error occurs', () => {
      It('should return error when product repository throws', async () => {
        productRepo.getProduct.mockRejectedValue(
          new Error('database connection failed'),
        );

        const result = await feature.createOrder(validCreateParam);

        expect(result.status.is(StatusCode.SUCCESS)).toBe(false);
        expect(idGenerator.generateIds).not.toHaveBeenCalled();
        expect(orderRepo.createOrder).not.toHaveBeenCalled();
      });

      It('should return error when order repository throws', async () => {
        mockSuccessfulCreateDependencies();

        orderRepo.createOrder.mockRejectedValue(
          new Error('database connection failed'),
        );

        const result = await feature.createOrder(validCreateParam);

        expect(result.status.is(StatusCode.SUCCESS)).toBe(false);
      });
    });
  });
});
