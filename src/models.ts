export enum SlaEventType {
  New,
  No
}

export interface SlaEvent {
  type: SlaEventType,
  payload: SlaPayload
}

export interface SlaPayload {
  sla: string
  color?: string
  title?: string
  description?: string
  auth?: string
}
