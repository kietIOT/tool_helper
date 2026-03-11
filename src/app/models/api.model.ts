// ============ Common ============

export interface BaseResponse<T = unknown> {
  isSuccess: boolean;
  data?: T;
  message?: string;
}

export type TrackingStatus =
  | 'Preparing'
  | 'InTransit'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned'
  | 'Exception';

// ============ Health ============

export interface HealthResponse {
  status: string;
  timestamp: string;
}

// Deploy models moved to host.model.ts (DeployByNameRequest, DeploymentResultDto, DeploymentHistoryDto)

// ============ SPX Express ============

export interface SpxTrackingData {
  fulfillmentInfo?: { deliverType: number };
  slsTrackingInfo?: SlsTrackingInfo;
  isInstantOrder: boolean;
  isShopeeMarketOrder: boolean;
}

export interface SlsTrackingInfo {
  slsTrackingNumber?: string;
  clientOrderId?: string;
  receiverName?: string;
  receiverTypeName?: string;
  records?: SpxTrackingRecord[];
}

export interface SpxTrackingRecord {
  trackingCode?: string;
  trackingName?: string;
  description?: string;
  displayFlag: number;
  actualTime: number;
  reasonCode?: string;
  reasonDescription?: string;
  epod?: string;
  currentLocation?: SpxLocation;
  nextLocation?: SpxLocation;
  displayFlagV2: number;
  buyerDescription?: string;
  sellerDescription?: string;
  milestoneCode: number;
  milestoneName?: string;
}

export interface SpxLocation {
  locationName?: string;
  locationTypeName?: string;
  lng?: string;
  lat?: string;
  fullAddress?: string;
}

// ============ SPX Tracking ============

export interface ShipmentStatusData {
  spxTn: string;
  clientOrderId?: string;
  status: TrackingStatus;
  lastEventCode?: string;
  lastMilestoneName?: string;
  lastMessage?: string;
  lastEventTime?: string;
  currentLocationName?: string;
  currentFullAddress?: string;
  nextLocationName?: string;
  nextFullAddress?: string;
  isTerminal: boolean;
  events: ShipmentEvent[];
}

export interface ShipmentEvent {
  trackingCode?: string;
  milestoneName?: string;
  buyerMessage?: string;
  description?: string;
  eventTime: string;
}

export interface ActiveShipmentItem {
  spxTn: string;
  clientOrderId?: string;
  status: TrackingStatus;
  lastEventCode?: string;
  lastMilestoneName?: string;
  lastMessage?: string;
  lastEventTime?: string;
  currentLocationName?: string;
  isTerminal: boolean;
}

// ============ Docker Monitor ============

export interface ContainerStat {
  name: string;
  cpuPercent: number;
  memUsage: string;
  memPercent: number;
  netIO: string;
  blockIO: string;
  pids: number;
}

export interface DiskInfo {
  filesystem: string;
  size: string;
  used: string;
  available: string;
  usePercent: number;
  mountPoint: string;
}

export interface FullReport {
  containers: ContainerStat[];
  disk: DiskInfo[];
}

// ============ Yoosee Camera ============

export interface StreamUrlData {
  streamUrl: string;
}
