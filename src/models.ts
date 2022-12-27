export enum SlaEventType {
  No,
  New,
  History,
}

export interface SlaEvent {
  type: SlaEventType,
  payload: SlaPayload
}

export interface HistoryEvent {
  type: SlaEventType.History,
  payload: HistoryObject
}

interface SlaObject {
  h: number | null
  m: number | null
  s: number | null
}

export interface SlaPayload {
  sla: string
  createdAt?: Date
  slaObject?: SlaObject
  color?: string
  title?: string
  description?: string
}


export interface WorkProduct {
  inputArtifactURLs: string[];
  id: string;
  name: string;
  __typename: string;
}

export interface WorkUnit {
  name: string;
  __typename: string;
}

export interface Task {
  id: string;
  companyId: string;
  productId: string;
  assemblyLineId: string;
  workProduct: WorkProduct;
  workUnitId: string;
  workUnit: WorkUnit;
  taskType: string;
  priority: number;
  sla: number;
  name: string;
  artifactURLs: any[];
  inputArtifactURLs: string[];
  inputQualityBar: string;
  description: string;
  fetchedAt: Date;
  fetchedBy: string;
  doerWorkerId?: any;
  doTaskId?: any;
  doCompletedAt?: any;
  qcOutcome?: any;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  completedAt?: any;
  durationInSeconds?: any;
  rejectReason?: any;
  rejectDetails?: any;
  andonCordPullReason?: any;
  andonCordPullDetails?: any;
  andonCordResolution?: any;
  andonCordRestartALName: string;
  __typename: string;
}

export interface History extends Task {

}

export interface CurrentTask {
  task: Task;
  history: History[];
  automations: any[];
  __typename: string;
}

export interface Data {
  currentTasks: CurrentTask[];
}

export interface HistoryObject {
  data: Data;
}


