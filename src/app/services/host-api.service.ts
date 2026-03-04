import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, catchError, map, forkJoin, timeout, tap } from 'rxjs';
import { Host, HostStats, DockerService, DeployRequest, DeployResponse, ServiceLog } from '../models';
import { HostStore } from './host-store.service';

@Injectable({ providedIn: 'root' })
export class HostApiService {
  private http = inject(HttpClient);
  private hostStore = inject(HostStore);

  /** Check if a host is reachable */
  checkHealth(host: Host): Observable<boolean> {
    return this.http.get<any>(`${host.url}/api/health`).pipe(
      timeout(5000),
      map(() => {
        this.hostStore.updateHostStatus(host.id, 'online');
        return true;
      }),
      catchError(() => {
        this.hostStore.updateHostStatus(host.id, 'offline');
        return of(false);
      })
    );
  }

  /** Get host system stats (CPU, memory, disk) */
  getHostStats(host: Host): Observable<HostStats | null> {
    return this.http.get<HostStats>(`${host.url}/api/stats`).pipe(
      timeout(10000),
      catchError(() => of(null))
    );
  }

  /** Get all Docker services running on a host */
  getServices(host: Host): Observable<DockerService[]> {
    return this.http.get<DockerService[]>(`${host.url}/api/services`).pipe(
      timeout(10000),
      catchError(() => of([]))
    );
  }

  /** Get a single service detail */
  getService(host: Host, serviceId: string): Observable<DockerService | null> {
    return this.http.get<DockerService>(`${host.url}/api/services/${serviceId}`).pipe(
      timeout(10000),
      catchError(() => of(null))
    );
  }

  /** Deploy a service */
  deploy(host: Host, request: DeployRequest): Observable<DeployResponse> {
    return this.http.post<DeployResponse>(`${host.url}/api/deploy`, request).pipe(
      timeout(120000),
      catchError((err: HttpErrorResponse) => of({
        success: false,
        message: err.error?.message || 'Deploy failed: ' + err.message
      }))
    );
  }

  /** Start a stopped service */
  startService(host: Host, serviceId: string): Observable<boolean> {
    return this.http.post<any>(`${host.url}/api/services/${serviceId}/start`, {}).pipe(
      timeout(30000),
      map(() => true),
      catchError(() => of(false))
    );
  }

  /** Stop a running service */
  stopService(host: Host, serviceId: string): Observable<boolean> {
    return this.http.post<any>(`${host.url}/api/services/${serviceId}/stop`, {}).pipe(
      timeout(30000),
      map(() => true),
      catchError(() => of(false))
    );
  }

  /** Restart a service */
  restartService(host: Host, serviceId: string): Observable<boolean> {
    return this.http.post<any>(`${host.url}/api/services/${serviceId}/restart`, {}).pipe(
      timeout(30000),
      map(() => true),
      catchError(() => of(false))
    );
  }

  /** Remove a service */
  removeService(host: Host, serviceId: string): Observable<boolean> {
    return this.http.delete<any>(`${host.url}/api/services/${serviceId}`).pipe(
      timeout(30000),
      map(() => true),
      catchError(() => of(false))
    );
  }

  /** Get service logs */
  getServiceLogs(host: Host, serviceId: string, lines = 100): Observable<ServiceLog[]> {
    return this.http.get<ServiceLog[]>(
      `${host.url}/api/services/${serviceId}/logs?lines=${lines}`
    ).pipe(
      timeout(15000),
      catchError(() => of([]))
    );
  }

  /** Check health for all hosts */
  checkAllHosts(hosts: Host[]): Observable<Map<string, boolean>> {
    if (hosts.length === 0) return of(new Map());
    const checks = hosts.reduce((acc, host) => {
      acc[host.id] = this.checkHealth(host);
      return acc;
    }, {} as Record<string, Observable<boolean>>);
    return forkJoin(checks).pipe(
      map(results => new Map(Object.entries(results)))
    );
  }

  /** Get stats for all hosts */
  getAllHostStats(hosts: Host[]): Observable<Map<string, HostStats | null>> {
    if (hosts.length === 0) return of(new Map());
    const stats = hosts.reduce((acc, host) => {
      acc[host.id] = this.getHostStats(host);
      return acc;
    }, {} as Record<string, Observable<HostStats | null>>);
    return forkJoin(stats).pipe(
      map(results => new Map(Object.entries(results)))
    );
  }

  /** Get services for all hosts */
  getAllServices(hosts: Host[]): Observable<Map<string, DockerService[]>> {
    if (hosts.length === 0) return of(new Map());
    const services = hosts.reduce((acc, host) => {
      acc[host.id] = this.getServices(host);
      return acc;
    }, {} as Record<string, Observable<DockerService[]>>);
    return forkJoin(services).pipe(
      map(results => new Map(Object.entries(results)))
    );
  }
}
