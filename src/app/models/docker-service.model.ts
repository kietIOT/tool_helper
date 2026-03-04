export interface DockerService {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'restarting' | 'exited' | 'created' | 'dead';
  state: string;
  ports: string[];
  createdAt: string;
  uptime: string;
  cpuUsage: number;       // percentage
  memoryUsage: number;    // bytes
  memoryLimit: number;    // bytes
  networkIn: number;      // bytes
  networkOut: number;     // bytes
  volumes: string[];
  labels: Record<string, string>;
  restartCount: number;
}

export interface DeployRequest {
  serviceName: string;
  image: string;
  tag: string;
  ports?: string[];
  envVars?: Record<string, string>;
  volumes?: string[];
  restart?: string;
}

export interface DeployResponse {
  success: boolean;
  message: string;
  containerId?: string;
}

export interface ServiceLog {
  timestamp: string;
  message: string;
  stream: 'stdout' | 'stderr';
}
