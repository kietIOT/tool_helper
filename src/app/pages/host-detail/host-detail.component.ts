import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';
import {
  HostDetailDto,
  ServiceDto,
  ContainerStat,
  DiskInfo,
  HealthResponse,
  CreateServiceRequest,
  UpdateServiceRequest,
} from '../../models';
import { HostManagementApiService, ToolHelperApiService } from '../../services';

@Component({
  selector: 'app-host-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './host-detail.component.html',
  styleUrl: './host-detail.component.scss',
})
export class HostDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private api = inject(HostManagementApiService);
  private helperApi = inject(ToolHelperApiService);
  private destroy$ = new Subject<void>();

  host: HostDetailDto | null = null;
  health: HealthResponse | null = null;
  containers: ContainerStat[] = [];
  disks: DiskInfo[] = [];
  loading = true;
  activeTab: 'services' | 'containers' | 'disk' = 'services';
  checking = false;

  // Service form
  showServiceForm = false;
  editingService: ServiceDto | null = null;
  savingService = false;
  serviceForm: CreateServiceRequest = {
    name: '', type: 'DockerCompose',
  };

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params['id'];
      this.loadHost(id);
    });

    interval(30000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.host) this.loadMonitorData();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private get agentUrl(): string {
    if (!this.host) return '';
    return `http://${this.host.ipAddress}:${this.host.agentPort}`;
  }

  loadHost(hostId: string): void {
    this.loading = true;
    this.api.getHost(hostId).pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res.isSuccess && res.data) {
        this.host = res.data;
        this.loadMonitorData();
      }
      this.loading = false;
    });
  }

  loadMonitorData(): void {
    if (!this.host) return;
    const url = this.agentUrl;

    this.helperApi.healthCheck(url).pipe(takeUntil(this.destroy$)).subscribe(h => {
      this.health = h;
    });

    this.helperApi.getContainerStats(url).pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.containers = res.isSuccess && res.data ? res.data : [];
    });

    this.helperApi.getDiskUsage(url).pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.disks = res.isSuccess && res.data ? res.data : [];
    });
  }

  triggerCheck(): void {
    if (!this.host) return;
    this.checking = true;
    this.helperApi.triggerMonitorCheck(this.agentUrl).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.checking = false;
      this.loadMonitorData();
    });
  }

  // ============ Service CRUD ============

  openAddService(): void {
    this.serviceForm = { name: '', type: 'DockerCompose' };
    this.editingService = null;
    this.showServiceForm = true;
  }

  openEditService(svc: ServiceDto): void {
    this.serviceForm = {
      name: svc.name,
      description: svc.description,
      type: svc.type,
      port: svc.port,
      healthCheckUrl: svc.healthCheckUrl,
      imageName: svc.imageName,
      version: svc.version,
      composeFilePath: svc.composeFilePath,
      workingDirectory: svc.workingDirectory,
      dockerfilePath: svc.dockerfilePath,
      containerName: svc.containerName,
      deployCommand: svc.deployCommand,
      stopCommand: svc.stopCommand,
      restartCommand: svc.restartCommand,
    };
    this.editingService = svc;
    this.showServiceForm = true;
  }

  closeServiceForm(): void {
    this.showServiceForm = false;
    this.editingService = null;
  }

  saveService(): void {
    if (!this.host || !this.serviceForm.name) return;
    this.savingService = true;

    if (this.editingService) {
      const req: UpdateServiceRequest = { ...this.serviceForm };
      this.api.updateService(this.host.id, this.editingService.id, req)
        .pipe(takeUntil(this.destroy$))
        .subscribe(res => {
          this.savingService = false;
          if (res.isSuccess) {
            this.closeServiceForm();
            this.loadHost(this.host!.id);
          } else {
            alert(res.message || 'Update failed');
          }
        });
    } else {
      this.api.createService(this.host.id, this.serviceForm)
        .pipe(takeUntil(this.destroy$))
        .subscribe(res => {
          this.savingService = false;
          if (res.isSuccess) {
            this.closeServiceForm();
            this.loadHost(this.host!.id);
          } else {
            alert(res.message || 'Create failed');
          }
        });
    }
  }

  deleteService(svc: ServiceDto): void {
    if (!this.host) return;
    if (confirm(`Delete service "${svc.name}"? All deployment histories will be removed.`)) {
      this.api.deleteService(this.host.id, svc.id).pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (res.isSuccess) {
          this.loadHost(this.host!.id);
        } else {
          alert(res.message || 'Delete failed');
        }
      });
    }
  }

  // ============ Helpers ============

  getCpuColor(cpu: number): string {
    if (cpu >= 80) return '#ef4444';
    if (cpu >= 60) return '#f59e0b';
    return '#22c55e';
  }

  getDiskColor(percent: number): string {
    if (percent >= 95) return '#ef4444';
    if (percent >= 85) return '#f59e0b';
    return '#22c55e';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Running': case 'Online': case 'Success': return '#22c55e';
      case 'Stopped': case 'Offline': return '#64748b';
      case 'Error': case 'Failed': return '#ef4444';
      case 'InProgress': case 'Pending': return '#f59e0b';
      default: return '#94a3b8';
    }
  }

  refresh(): void {
    if (this.host) this.loadHost(this.host.id);
  }
}
