import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import {
  HostDto,
  HostDetailDto,
  ServiceDto,
  DeployByNameRequest,
  DeploymentResultDto,
  DeploymentHistoryDto,
} from '../../models';
import { HostStore, HostManagementApiService } from '../../services';

@Component({
  selector: 'app-deploy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deploy.component.html',
  styleUrl: './deploy.component.scss',
})
export class DeployComponent implements OnInit, OnDestroy {
  private hostStore = inject(HostStore);
  private api = inject(HostManagementApiService);
  private destroy$ = new Subject<void>();

  hosts: HostDto[] = [];
  selectedHostId = '';
  services: ServiceDto[] = [];
  selectedServiceName = '';
  loadingServices = false;
  deploying = false;
  result: DeploymentResultDto | null = null;
  errorMessage: string | null = null;

  // Deploy history
  history: DeploymentHistoryDto[] = [];
  loadingHistory = false;

  ngOnInit(): void {
    this.hostStore.hosts$.pipe(takeUntil(this.destroy$)).subscribe(hosts => {
      this.hosts = hosts;
      if (hosts.length > 0 && !this.selectedHostId) {
        this.selectedHostId = hosts[0].id;
        this.loadServices();
      }
    });
    this.hostStore.loadHosts(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get selectedHost(): HostDto | undefined {
    return this.hosts.find(h => h.id === this.selectedHostId);
  }

  onHostChange(): void {
    this.selectedServiceName = '';
    this.result = null;
    this.errorMessage = null;
    this.history = [];
    this.loadServices();
  }

  loadServices(): void {
    if (!this.selectedHostId) return;
    this.loadingServices = true;
    this.services = [];
    this.api.getHost(this.selectedHostId).pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res.isSuccess && res.data) {
        this.services = res.data.services.filter(s => s.isActive);
      }
      this.loadingServices = false;
    });
  }

  onServiceChange(): void {
    this.result = null;
    this.errorMessage = null;
    if (this.selectedServiceName) {
      this.loadHistory();
    }
  }

  loadHistory(): void {
    if (!this.selectedServiceName) return;
    this.loadingHistory = true;
    this.api.getDeploymentHistoryByName(this.selectedServiceName, 10)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.history = res.isSuccess && res.data ? res.data : [];
        this.loadingHistory = false;
      });
  }

  deploy(): void {
    if (!this.selectedServiceName) return;

    this.deploying = true;
    this.result = null;
    this.errorMessage = null;

    const request: DeployByNameRequest = {
      serviceName: this.selectedServiceName,
      triggeredBy: 'WebUI',
    };

    this.api.deploy(request).pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res.isSuccess && res.data) {
        this.result = res.data;
      } else {
        this.errorMessage = res.message || 'Deploy failed';
        if (res.data) {
          this.result = res.data;
        }
      }
      this.deploying = false;
      this.loadHistory();
    });
  }

  resetForm(): void {
    this.selectedServiceName = '';
    this.result = null;
    this.errorMessage = null;
    this.history = [];
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Success': return '#22c55e';
      case 'Failed': return '#ef4444';
      case 'InProgress': return '#f59e0b';
      case 'Pending': return '#64748b';
      default: return '#94a3b8';
    }
  }
}
