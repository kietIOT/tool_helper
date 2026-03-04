export interface Host {
  id: string;
  name: string;
  url: string;       // base URL of tool-helper API on that host
  ip: string;
  status: 'online' | 'offline' | 'unknown';
  os?: string;
  description?: string;
  lastChecked?: string;
}

export interface HostStats {
  cpuUsage: number;       // percentage 0-100
  cpuCores: number;
  memoryUsed: number;     // bytes
  memoryTotal: number;    // bytes
  diskUsed: number;       // bytes
  diskTotal: number;      // bytes
  networkIn: number;      // bytes/s
  networkOut: number;     // bytes/s
  uptime: string;         // human-readable
  loadAverage: number[];  // 1, 5, 15 min
}

export interface HostFormData {
  name: string;
  url: string;
  ip: string;
  description?: string;
}
