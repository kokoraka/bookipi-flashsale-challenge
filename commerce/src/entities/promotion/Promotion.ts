export enum PromotionState {
  INVALID = 'invalid',
  DISABLED = 'disabled',
  UPCOMING = 'upcoming',
  ENDED = 'ended',
  ONGOING = 'ongoing',
}

export class Promotion {
  constructor(
    private readonly isEnabled: boolean,
    private readonly startTime: Date,
    private readonly endTime: Date,
    private readonly currentTime: Date = new Date(),
  ) { }

  private static readonly STATE_MESSAGES: Record<PromotionState, string> = {
    [PromotionState.INVALID]: 'promotion is invalid',
    [PromotionState.DISABLED]: 'promotion is disabled',
    [PromotionState.UPCOMING]: 'promotion is not started yet',
    [PromotionState.ENDED]: 'promotion has ended',
    [PromotionState.ONGOING]: 'promotion is ongoing',
  }

  public getStateCode(): PromotionState {
    if (!this.valid()) {
      return PromotionState.INVALID
    }

    if (!this.isEnabled) {
      return PromotionState.DISABLED
    }

    if (this.currentTime.getTime() < this.startTime.getTime()) {
      return PromotionState.UPCOMING
    }

    if (this.currentTime.getTime() >= this.endTime.getTime()) {
      return PromotionState.ENDED
    }

    return PromotionState.ONGOING
  }

  public getStateMessage(): string {
    return Promotion.STATE_MESSAGES[this.getStateCode()]
  }

  public isState(state: PromotionState): boolean {
    return this.getStateCode() === state
  }

  private valid(): boolean {
    const currentTimestamp = this.currentTime.getTime()
    const startTimestamp = this.startTime.getTime()
    const endTimestamp = this.endTime.getTime()

    if (!Number.isFinite(currentTimestamp) || !Number.isFinite(startTimestamp) || !Number.isFinite(endTimestamp)) {
      return false
    }

    if (startTimestamp >= endTimestamp) {
      return false
    }

    return true
  }
}
