import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';
import { HostStore, ToolHelperApiService } from '../../services';
import { HostDto, DashboardDto, ActiveShipmentItem } from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private hostStore = inject(HostStore);
  private api = inject(ToolHelperApiService);
  private destroy$ = new Subject<void>();

  dashboard: DashboardDto | null = null;
  hosts: HostDto[] = [];
  activeShipments: ActiveShipmentItem[] = [];
  loading = true;
  lastRefresh = new Date();

  get totalHosts(): number { return this.dashboard?.totalHosts ?? 0; }
  get onlineHosts(): number { return this.dashboard?.onlineHosts ?? 0; }
  get offlineHosts(): number { return this.dashboard?.offlineHosts ?? 0; }
  get totalServices(): number { return this.dashboard?.totalServices ?? 0; }
  get runningServices(): number { return this.dashboard?.runningServices ?? 0; }

  features = [
    { icon: 'rocket_launch', label: 'Deploy', route: '/deploy', desc: 'Deploy Docker Compose services', color: '#3b82f6' },
    { icon: 'monitoring', label: 'Monitor', route: '/hosts', desc: 'Host & service management', color: '#8b5cf6' },
    { icon: 'local_shipping', label: 'SPX Tracking', route: '/spx', desc: 'Track SPX Express shipments', color: '#f59e0b' },
    { icon: 'videocam', label: 'Camera', route: '/camera', desc: 'Yoosee camera PTZ control', color: '#22c55e' },
  ];

  ngOnInit(): void {
    this.hostStore.dashboard$.pipe(takeUntil(this.destroy$)).subscribe(d => {
      this.dashboard = d;
      this.hosts = d?.hosts ?? [];
    });
    this.loadData();
    interval(30000).pipe(takeUntil(this.destroy$)).subscribe(() => this.loadData());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading = true;
    this.hostStore.loadDashboard();
    this.hostStore.loading$.pipe(takeUntil(this.destroy$)).subscribe(loading => {
      if (!loading) {
        this.lastRefresh = new Date();
        this.loading = false;
      }
    });
  }

  refresh(): void {
    this.loadData();
  }

  trackByHostId(_: number, host: HostDto): string {
    return host.id;
  }
}
