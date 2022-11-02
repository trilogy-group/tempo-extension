export enum SlaEventType {
  New,
  No
}

export interface SlaEvent {
  type: SlaEventType,
  payload: {message: string}
}
