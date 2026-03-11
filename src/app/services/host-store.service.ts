import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HostDto, DashboardDto } from '../models';
import { HostManagementApiService } from './host-management-api.service';

@Injectable({ providedIn: 'root' })
export class HostStore {
  private api = inject(HostManagementApiService);

  private hostsSubject = new BehaviorSubject<HostDto[]>([]);
  private dashboardSubject = new BehaviorSubject<DashboardDto | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  hosts$ = this.hostsSubject.asObservable();
  dashboard$ = this.dashboardSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  // ============ Dashboard ============

  loadDashboard(): void {
    this.loadingSubject.next(true);
    this.api.getDashboard().subscribe(res => {
      if (res.isSuccess && res.data) {
        this.dashboardSubject.next(res.data);
        this.hostsSubject.next(res.data.hosts);
      }
      this.loadingSubject.next(false);
    });
  }

  // ============ Host List ============

  loadHosts(activeOnly?: boolean): void {
    this.loadingSubject.next(true);
    this.api.getHosts(activeOnly).subscribe(res => {
      if (res.isSuccess && res.data) {
        this.hostsSubject.next(res.data);
      }
      this.loadingSubject.next(false);
    });
  }

  getHosts(): HostDto[] {
    return this.hostsSubject.getValue();
  }

  getHostById(id: string): HostDto | undefined {
    return this.getHosts().find(h => h.id === id);
  }

  getDashboard(): DashboardDto | null {
    return this.dashboardSubject.getValue();
  }
}

