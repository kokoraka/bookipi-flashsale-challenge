
import {
  PromotionRepositoryInterface,
  GetPromotionParam,
  GetPromotionResult,
} from '../repository.js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Status } from '../../entities/status/Status.js';
import { StatusCode } from '../../entities/status/StatusCode.js';
import { Promotion } from '../../entities/promotion/Promotion.js';

@Injectable()
export class PromotionRepository implements PromotionRepositoryInterface {
  constructor(
    private readonly configService: ConfigService
  ) { }

  async getPromotion(p: GetPromotionParam): Promise<GetPromotionResult> {
    try {
      const currentTs = new Date()
      const isPromotionEnabled = this.configService.get<boolean>('PROMOTION_ENABLED') ?? false
      const promotionId = this.configService.get<string>('PROMOTION_ID') ?? ''
      const promotionStartTime = new Date(parseInt(this.configService.get<string>('PROMOTION_START_TIME') ?? '0'))
      const promotionEndTime = new Date(parseInt(this.configService.get<string>('PROMOTION_END_TIME') ?? '0'))
      const promotion = new Promotion(isPromotionEnabled, promotionStartTime, promotionEndTime, currentTs)
      if (p.unique_id != promotionId || !promotion.valid()) {
        return {
          status: new Status(StatusCode.RESOURCE_NOT_FOUND, 'promotion not found'),
        };
      }

      return {
        status: new Status(StatusCode.SUCCESS, 'success get promotion'),
        promotion: {
          unique_id: promotionId,
          is_enabled: isPromotionEnabled,
          start_at: promotionStartTime,
          end_at: promotionEndTime,
        }
      };
    } catch (e: unknown) {
      return {
        status: Status.fromError(e),
      };
    }
  }
}
