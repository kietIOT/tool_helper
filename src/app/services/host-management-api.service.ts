import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  BaseResponse,
  DashboardDto,
  HostDto,
  HostDetailDto,
  ServiceDto,
  CreateHostRequest,
  UpdateHostRequest,
  CreateServiceRequest,
  UpdateServiceRequest,
  DeployByNameRequest,
  DeploymentResultDto,
  DeploymentHistoryDto,
} from '../models';

@Injectable({ providedIn: 'root' })
export class HostManagementApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.hostManagementApiUrl;

  // ============ Dashboard ============

  getDashboard(): Observable<BaseResponse<DashboardDto>> {
    return this.http.get<BaseResponse<DashboardDto>>(`${this.baseUrl}/api/hosts/dashboard`).pipe(
      timeout(10000),
      catchError(err => of({ isSuccess: false, message: err.message }))
    );
  }

  // ============ Host CRUD ============

  getHosts(activeOnly?: boolean): Observable<BaseResponse<HostDto[]>> {
    let params = new HttpParams();
    if (activeOnly !== undefined) {
      params = params.set('activeOnly', activeOnly.toString());
    }
    return this.http.get<BaseResponse<HostDto[]>>(`${this.baseUrl}/api/hosts`, { params }).pipe(
      timeout(10000),
      catchError(err => of({ isSuccess: false, message: err.message }))
    );
  }

  getHost(hostId: string): Observable<BaseResponse<HostDetailDto>> {
    return this.http.get<BaseResponse<HostDetailDto>>(`${this.baseUrl}/api/hosts/${hostId}`).pipe(
      timeout(10000),
      catchError(err => of({ isSuccess: false, message: err.message }))
    );
  }

  createHost(request: CreateHostRequest): Observable<BaseResponse<HostDetailDto>> {
    return this.http.post<BaseResponse<HostDetailDto>>(`${this.baseUrl}/api/hosts`, request).pipe(
      timeout(10000),
      catchError(err => of({ isSuccess: false, message: err.error?.message || err.message }))
    );
  }

  updateHost(hostId: string, request: UpdateHostRequest): Observable<BaseResponse<HostDetailDto>> {
    return this.http.put<BaseResponse<HostDetailDto>>(`${this.baseUrl}/api/hosts/${hostId}`, request).pipe(
      timeout(10000),
      catchError(err => of({ isSuccess: false, message: err.error?.message || err.message }))
    );
  }

  deleteHost(hostId: string): Observable<BaseResponse<object>> {
    return this.http.delete<BaseResponse<object>>(`${this.baseUrl}/api/hosts/${hostId}`).pipe(
      timeout(10000),
      catchError(err => of({ isSuccess: false, message: err.error?.message || err.message }))
    );
  }

  // ============ Service CRUD ============

  getServices(hostId: string): Observable<BaseResponse<ServiceDto[]>> {
    return this.http.get<BaseResponse<ServiceDto[]>>(`${this.baseUrl}/api/hosts/${hostId}/services`).pipe(
      timeout(10000),
      catchError(err => of({ isSuccess: false, message: err.message }))
    );
  }

  getService(hostId: string, serviceId: string): Observable<BaseResponse<ServiceDto>> {
    return this.http.get<BaseResponse<ServiceDto>>(
      `${this.baseUrl}/api/hosts/${hostId}/services/${serviceId}`
    ).pipe(
      timeout(10000),
      catchError(err => of({ isSuccess: false, message: err.message }))
    );
  }

  createService(hostId: string, request: CreateServiceRequest): Observable<BaseResponse<ServiceDto>> {
    return this.http.post<BaseResponse<ServiceDto>>(
      `${this.baseUrl}/api/hosts/${hostId}/services`, request
    ).pipe(
      timeout(10000),
      catchError(err => of({ isSuccess: false, message: err.error?.message || err.message }))
    );
  }

  updateService(hostId: string, serviceId: string, request: UpdateServiceRequest): Observable<BaseResponse<ServiceDto>> {
    return this.http.put<BaseResponse<ServiceDto>>(
      `${this.baseUrl}/api/hosts/${hostId}/services/${serviceId}`, request
    ).pipe(
      timeout(10000),
      catchError(err => of({ isSuccess: false, message: err.error?.message || err.message }))
    );
  }

  deleteService(hostId: string, serviceId: string): Observable<BaseResponse<object>> {
    return this.http.delete<BaseResponse<object>>(
      `${this.baseUrl}/api/hosts/${hostId}/services/${serviceId}`
    ).pipe(
      timeout(10000),
      catchError(err => of({ isSuccess: false, message: err.error?.message || err.message }))
    );
  }

  // ============ Deployment ============

  deploy(request: DeployByNameRequest): Observable<BaseResponse<DeploymentResultDto>> {
    return this.http.post<BaseResponse<DeploymentResultDto>>(
      `${this.baseUrl}/api/deployments`, request
    ).pipe(
      timeout(600000), // 10 min - large image pulls can be slow
      catchError(err => of({ isSuccess: false, message: err.error?.message || err.message }))
    );
  }

  getDeploymentHistory(serviceId: string, take = 20): Observable<BaseResponse<DeploymentHistoryDto[]>> {
    const params = new HttpParams().set('take', take.toString());
    return this.http.get<BaseResponse<DeploymentHistoryDto[]>>(
      `${this.baseUrl}/api/deployments/history/${serviceId}`, { params }
    ).pipe(
      timeout(10000),
      catchError(err => of({ isSuccess: false, message: err.message }))
    );
  }

  getDeploymentHistoryByName(serviceName: string, take = 20): Observable<BaseResponse<DeploymentHistoryDto[]>> {
    const params = new HttpParams().set('take', take.toString());
    return this.http.get<BaseResponse<DeploymentHistoryDto[]>>(
      `${this.baseUrl}/api/deployments/history/by-name/${encodeURIComponent(serviceName)}`, { params }
    ).pipe(
      timeout(10000),
      catchError(err => of({ isSuccess: false, message: err.message }))
    );
  }
}
