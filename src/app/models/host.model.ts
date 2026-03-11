// ============ Enums ============

export type HostStatus = 'Online' | 'Offline' | 'Degraded' | 'Unknown';

export type ServiceStatus = 'Running' | 'Stopped' | 'Error' | 'Unknown';

export type ServiceType =
  | 'DockerCompose'
  | 'DockerContainer'
  | 'Systemd'
  | 'WindowsService'
  | 'WebApp'
  | 'Database'
  | 'Other';

export type DeploymentStatus = 'Pending' | 'InProgress' | 'Success' | 'Failed' | 'RolledBack';

// ============ Dashboard ============

export interface DashboardDto {
  totalHosts: number;
  onlineHosts: number;
  offlineHosts: number;
  totalServices: number;
  runningServices: number;
  stoppedServices: number;
  errorServices: number;
  hosts: HostDto[];
}

// ============ Host ============

export interface HostDto {
  id: string;
  name: string;
  description?: string;
  ipAddress: string;
  agentPort: number;
  sshPort?: number;
  sshUsername?: string;
  os?: string;
  status: HostStatus;
  lastCheckedAt?: string;
  isActive: boolean;
  serviceCount: number;
  runningServiceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface HostDetailDto extends HostDto {
  services: ServiceDto[];
}

export interface CreateHostRequest {
  name: string;
  description?: string;
  ipAddress: string;
  agentPort?: number;
  sshPort?: number;
  sshUsername?: string;
  sshPrivateKeyPath?: string;
  sshPassword?: string;
  os?: string;
}

export interface UpdateHostRequest {
  name?: string;
  description?: string;
  ipAddress?: string;
  agentPort?: number;
  sshPort?: number;
  sshUsername?: string;
  sshPrivateKeyPath?: string;
  sshPassword?: string;
  os?: string;
  isActive?: boolean;
}

// ============ Service ============

export interface ServiceDto {
  id: string;
  hostId: string;
  hostName: string;
  name: string;
  description?: string;
  type: ServiceType;
  status: ServiceStatus;
  port?: number;
  healthCheckUrl?: string;
  imageName?: string;
  version?: string;
  composeFilePath?: string;
  workingDirectory?: string;
  dockerfilePath?: string;
  containerName?: string;
  deployCommand?: string;
  stopCommand?: string;
  restartCommand?: string;
  lastDeploymentStatus?: DeploymentStatus;
  lastDeployedAt?: string;
  lastCheckedAt?: string;
  startedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  type?: ServiceType;
  port?: number;
  healthCheckUrl?: string;
  imageName?: string;
  version?: string;
  composeFilePath?: string;
  workingDirectory?: string;
  dockerfilePath?: string;
  containerName?: string;
  deployCommand?: string;
  stopCommand?: string;
  restartCommand?: string;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  type?: ServiceType;
  port?: number;
  healthCheckUrl?: string;
  imageName?: string;
  version?: string;
  composeFilePath?: string;
  workingDirectory?: string;
  dockerfilePath?: string;
  containerName?: string;
  deployCommand?: string;
  stopCommand?: string;
  restartCommand?: string;
  isActive?: boolean;
}

// ============ Deployment ============

export interface DeployByNameRequest {
  serviceName: string;
  version?: string;
  triggeredBy?: string;
}

export interface DeploymentResultDto {
  deploymentId: string;
  serviceId: string;
  serviceName: string;
  hostId: string;
  hostName: string;
  hostIp: string;
  status: DeploymentStatus;
  output?: string;
  errorMessage?: string;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
}

export interface DeploymentHistoryDto {
  id: string;
  serviceId: string;
  serviceName: string;
  status: DeploymentStatus;
  version?: string;
  triggeredBy?: string;
  output?: string;
  errorMessage?: string;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
}

// ============ Legacy aliases (backward compat) ============

/** @deprecated Use HostDto instead */
export type Host = HostDto;
/** @deprecated Use CreateHostRequest instead */
export type HostFormData = CreateHostRequest;
