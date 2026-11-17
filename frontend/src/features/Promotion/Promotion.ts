import { dateFormat, isSameDay } from "../../services/date/date"

export enum PromotionState {
  INVALID = 'invalid',
  DISABLED = 'disabled',
  UPCOMING = 'upcoming',
  ENDED = 'ended',
  ONGOING = 'ongoing',
}

export const PROMOTION_LABEL: Record<PromotionState, string> = {
  [PromotionState.INVALID]: 'Invalid',
  [PromotionState.DISABLED]: 'Disabled',
  [PromotionState.UPCOMING]: 'Upcoming',
  [PromotionState.ENDED]: 'Ended',
  [PromotionState.ONGOING]: 'Ongoing',
}

type PromotionViewParam = {
  unique_id: string
  start_at: Date
  end_at: Date
  state: PromotionState
}

export class PromotionView {
  private unique_id: string
  private start_at: Date
  private end_at: Date
  private state: PromotionState

  constructor(p: PromotionViewParam
  ) {
    this.unique_id = p.unique_id
    this.start_at = p.start_at
    this.end_at = p.end_at
    this.state = p.state
  }

  getPromotionId(): string {
    return this.unique_id
  }

  isUpcoming(): boolean {
    return this.state == PromotionState.UPCOMING
  }

  isEnded(): boolean {
    return this.state == PromotionState.ENDED
  }

  isOngoing(): boolean {
    return this.state == PromotionState.ONGOING
  }

  getStateLabel(): string {
    return PROMOTION_LABEL[this.state as PromotionState]
  }

  getStateMessage(): string {
    if (isSameDay(this.start_at, this.end_at)) {
      return dateFormat(this.start_at, "h:mm:ss") + " - " + dateFormat(this.end_at, "h:mm:ss")
    }
    return dateFormat(this.start_at, "YYYY-MM-DD h:mm:ss") + " - " + dateFormat(this.end_at, "YYYY-MM-DD h:mm:ss")
  }
}