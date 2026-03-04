import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Host, HostStats, DockerService } from '../../models';
import { HostStore, HostApiService, MockDataService } from '../../services';
import { FileSizePipe } from '../../pipes/file-size.pipe';

@Component({
  selector: 'app-host-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FileSizePipe],
  templateUrl: './host-detail.component.html',
  styleUrl: './host-detail.component.scss',
})
export class HostDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private hostStore = inject(HostStore);
  private api = inject(HostApiService);
  private mock = inject(MockDataService);
  private destroy$ = new Subject<void>();

  host: Host | null = null;
  stats: HostStats | null = null;
  services: DockerService[] = [];
  loading = true;
  activeTab: 'services' | 'stats' | 'logs' = 'services';
  actionInProgress: string | null = null;

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params['id'];
      this.host = this.hostStore.getHostById(id) ?? null;
      if (this.host) {
        this.loadHostData();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadHostData(): void {
    if (!this.host) return;
    this.loading = true;

    // Mock data for dev — replace with real API
    this.hostStore.updateHostStatus(this.host.id, 'online');
    this.stats = this.mock.getMockStats();
    this.services = this.mock.getMockServices(this.host.name);
    this.loading = false;

    // Real API:
    // this.api.checkHealth(this.host).subscribe();
    // this.api.getHostStats(this.host).subscribe(s => this.stats = s);
    // this.api.getServices(this.host).subscribe(s => { this.services = s; this.loading = false; });
  }

  getMemoryPercent(): number {
    if (!this.stats) return 0;
    return Math.round((this.stats.memoryUsed / this.stats.memoryTotal) * 100);
  }

  getDiskPercent(): number {
    if (!this.stats) return 0;
    return Math.round((this.stats.diskUsed / this.stats.diskTotal) * 100);
  }

  getBarColor(value: number): string {
    if (value > 80) return '#ef4444';
    if (value > 60) return '#f59e0b';
    return '#22c55e';
  }

  getServiceMemPercent(svc: DockerService): number {
    if (!svc.memoryLimit) return 0;
    return Math.round((svc.memoryUsage / svc.memoryLimit) * 100);
  }

  runningCount(): number {
    return this.services.filter(s => s.status === 'running').length;
  }

  stoppedCount(): number {
    return this.services.filter(s => s.status !== 'running').length;
  }

  startService(svc: DockerService): void {
    if (!this.host) return;
    this.actionInProgress = svc.id;
    // Mock
    setTimeout(() => {
      svc.status = 'running';
      svc.state = 'Up just now';
      this.actionInProgress = null;
    }, 1000);
    // Real: this.api.startService(this.host, svc.id).subscribe(ok => { ... });
  }

  stopService(svc: DockerService): void {
    if (!this.host) return;
    this.actionInProgress = svc.id;
    setTimeout(() => {
      svc.status = 'stopped';
      svc.state = 'Exited (0) just now';
      this.actionInProgress = null;
    }, 1000);
  }

  restartService(svc: DockerService): void {
    if (!this.host) return;
    this.actionInProgress = svc.id;
    setTimeout(() => {
      svc.status = 'running';
      svc.state = 'Up just now';
      this.actionInProgress = null;
    }, 1500);
  }

  removeService(svc: DockerService): void {
    if (!this.host) return;
    if (!confirm(`Remove service "${svc.name}"? This will stop and delete the container.`)) return;
    this.actionInProgress = svc.id;
    setTimeout(() => {
      this.services = this.services.filter(s => s.id !== svc.id);
      this.actionInProgress = null;
    }, 1000);
  }

  refresh(): void {
    this.loadHostData();
  }

  trackBySvcId(index: number, svc: DockerService): string {
    return svc.id;
  }
}
