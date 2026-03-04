import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil, interval, startWith, switchMap } from 'rxjs';
import { HostStore, HostApiService, MockDataService } from '../../services';
import { Host, HostStats, DockerService } from '../../models';
import { FileSizePipe } from '../../pipes/file-size.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FileSizePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private hostStore = inject(HostStore);
  private api = inject(HostApiService);
  private mock = inject(MockDataService);
  private destroy$ = new Subject<void>();

  hosts: Host[] = [];
  hostStats = new Map<string, HostStats>();
  hostServices = new Map<string, DockerService[]>();
  loading = true;
  lastRefresh = new Date();

  // Summary
  get totalHosts(): number { return this.hosts.length; }
  get onlineHosts(): number { return this.hosts.filter(h => h.status === 'online').length; }
  get offlineHosts(): number { return this.hosts.filter(h => h.status === 'offline').length; }
  get totalServices(): number {
    let count = 0;
    this.hostServices.forEach(services => count += services.length);
    return count;
  }
  get runningServices(): number {
    let count = 0;
    this.hostServices.forEach(services => count += services.filter(s => s.status === 'running').length);
    return count;
  }
  get stoppedServices(): number {
    return this.totalServices - this.runningServices;
  }

  ngOnInit(): void {
    this.hostStore.hosts$.pipe(takeUntil(this.destroy$)).subscribe(hosts => {
      this.hosts = hosts;
    });
    this.loadData();

    // Auto-refresh every 30 seconds
    interval(30000).pipe(takeUntil(this.destroy$)).subscribe(() => this.loadData());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading = true;
    const hosts = this.hostStore.getHosts();

    // Use mock data for demo (replace with real API calls when backends are available)
    hosts.forEach(host => {
      // Simulate online/offline
      const isOnline = Math.random() > 0.2;
      this.hostStore.updateHostStatus(host.id, isOnline ? 'online' : 'offline');

      if (isOnline) {
        this.hostStats.set(host.id, this.mock.getMockStats());
        this.hostServices.set(host.id, this.mock.getMockServices(host.name));
      } else {
        this.hostStats.delete(host.id);
        this.hostServices.set(host.id, []);
      }
    });

    this.lastRefresh = new Date();
    this.loading = false;

    // Uncomment below to use real API:
    // this.api.checkAllHosts(hosts).pipe(takeUntil(this.destroy$)).subscribe();
    // this.api.getAllHostStats(hosts).pipe(takeUntil(this.destroy$)).subscribe(stats => this.hostStats = stats);
    // this.api.getAllServices(hosts).pipe(takeUntil(this.destroy$)).subscribe(svc => this.hostServices = svc);
  }

  getStats(hostId: string): HostStats | undefined {
    return this.hostStats.get(hostId) ?? undefined;
  }

  getServices(hostId: string): DockerService[] {
    return this.hostServices.get(hostId) ?? [];
  }

  getRunningCount(hostId: string): number {
    return this.getServices(hostId).filter(s => s.status === 'running').length;
  }

  getStoppedCount(hostId: string): number {
    return this.getServices(hostId).filter(s => s.status !== 'running').length;
  }

  getCpuColor(cpu: number): string {
    if (cpu > 80) return '#ef4444';
    if (cpu > 60) return '#f59e0b';
    return '#22c55e';
  }

  getMemoryPercent(stats: HostStats): number {
    return Math.round((stats.memoryUsed / stats.memoryTotal) * 100);
  }

  getDiskPercent(stats: HostStats): number {
    return Math.round((stats.diskUsed / stats.diskTotal) * 100);
  }

  refresh(): void {
    this.loadData();
  }

  trackByHostId(index: number, host: Host): string {
    return host.id;
  }
}
