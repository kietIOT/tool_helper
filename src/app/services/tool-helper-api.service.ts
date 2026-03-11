import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map, timeout } from 'rxjs';
import {
  BaseResponse,
  HealthResponse,
  SpxTrackingData,
  ShipmentStatusData,
  ActiveShipmentItem,
  ContainerStat,
  DiskInfo,
  FullReport,
  StreamUrlData,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ToolHelperApiService {
  private http = inject(HttpClient);

  // ============ Health ============

  healthCheck(baseUrl: string): Observable<HealthResponse | null> {
    return this.http.get<HealthResponse>(`${baseUrl}/api/health`).pipe(
      timeout(5000),
      catchError(() => of(null))
    );
  }

  // ============ Deploy (moved to HostManagementApiService) ============
  // Use HostManagementApiService.deploy() instead

  // ============ SPX Express Lookup ============

  spxLookup(baseUrl: string, orderId: string): Observable<BaseResponse<SpxTrackingData>> {
    return this.http.get<BaseResponse<SpxTrackingData>>(
      `${baseUrl}/api/spx-express/${encodeURIComponent(orderId)}`
    ).pipe(
      timeout(15000),
      catchError(err => of({ isSuccess: false, message: err.message }))
    );
  }

  // ============ SPX Tracking ============

  spxSubscribe(baseUrl: string, spxTn: string): Observable<BaseResponse<any>> {
    return this.http.post<BaseResponse<any>>(
      `${baseUrl}/api/spx-tracking/subscribe/${encodeURIComponent(spxTn)}`, {}
    ).pipe(
      timeout(15000),
      catchError(err => of({ isSuccess: false, message: err.message }))
    );
  }

  spxUnsubscribe(baseUrl: string, spxTn: string): Observable<BaseResponse<any>> {
    return this.http.post<BaseResponse<any>>(
      `${baseUrl}/api/spx-tracking/unsubscribe/${encodeURIComponent(spxTn)}`, {}
    ).pipe(
      timeout(10000),
      catchError(err => of({ isSuccess: false, message: err.message }))
    );
  }

  spxGetStatus(baseUrl: string, spxTn: string): Observable<BaseResponse<ShipmentStatusData>> {
    return this.http.get<BaseResponse<ShipmentStatusData>>(
      `${baseUrl}/api/spx-tracking/status/${encodeURIComponent(spxTn)}`
    ).pipe(
      timeout(10000),
      catchError(err => of({ isSuccess: false, message: err.message }))
    );
  }

  spxGetActive(baseUrl: string): Observable<BaseResponse<ActiveShipmentItem[]>> {
    return this.http.get<BaseResponse<ActiveShipmentItem[]>>(
      `${baseUrl}/api/spx-tracking/active`
    ).pipe(
      timeout(10000),
      catchError(err => of({ isSuccess: false, message: err.message }))
    );
  }

  spxTriggerPoll(baseUrl: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${baseUrl}/api/spx-tracking/poll`, {}
    ).pipe(
      timeout(30000),
      catchError(() => of({ message: 'Poll failed' }))
    );
  }

  // ============ Docker Monitor ============

  getContainerStats(baseUrl: string): Observable<BaseResponse<ContainerStat[]>> {
    return this.http.get<BaseResponse<ContainerStat[]>>(
      `${baseUrl}/api/monitor/containers`
    ).pipe(
      timeout(10000),
      catchError(err => of({ isSuccess: false, message: err.message }))
    );
  }

  getDiskUsage(baseUrl: string): Observable<BaseResponse<DiskInfo[]>> {
    return this.http.get<BaseResponse<DiskInfo[]>>(
      `${baseUrl}/api/monitor/disk`
    ).pipe(
      timeout(10000),
      catchError(err => of({ isSuccess: false, message: err.message }))
    );
  }

  getFullReport(baseUrl: string): Observable<BaseResponse<FullReport>> {
    return this.http.get<BaseResponse<FullReport>>(
      `${baseUrl}/api/monitor/report`
    ).pipe(
      timeout(15000),
      catchError(err => of({ isSuccess: false, message: err.message }))
    );
  }

  triggerMonitorCheck(baseUrl: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${baseUrl}/api/monitor/check`, {}
    ).pipe(
      timeout(15000),
      catchError(() => of({ message: 'Monitor check failed' }))
    );
  }

  // ============ Yoosee Camera PTZ ============

  getCameraActions(baseUrl: string): Observable<BaseResponse<string[]>> {
    return this.http.get<BaseResponse<string[]>>(
      `${baseUrl}/api/yoosee/actions`
    ).pipe(
      timeout(5000),
      catchError(err => of({ isSuccess: false, message: err.message }))
    );
  }

  moveCamera(baseUrl: string, ip: string, action: string): Observable<BaseResponse<null>> {
    return this.http.post<BaseResponse<null>>(
      `${baseUrl}/api/yoosee/${encodeURIComponent(ip)}/move/${encodeURIComponent(action)}`, {}
    ).pipe(
      timeout(5000),
      catchError(err => of({ isSuccess: false, message: err.message }))
    );
  }

  moveCameraAndStop(baseUrl: string, ip: string, action: string): Observable<BaseResponse<null>> {
    return this.http.post<BaseResponse<null>>(
      `${baseUrl}/api/yoosee/${encodeURIComponent(ip)}/move-stop/${encodeURIComponent(action)}`, {}
    ).pipe(
      timeout(5000),
      catchError(err => of({ isSuccess: false, message: err.message }))
    );
  }

  stopCamera(baseUrl: string, ip: string): Observable<BaseResponse<null>> {
    return this.http.post<BaseResponse<null>>(
      `${baseUrl}/api/yoosee/${encodeURIComponent(ip)}/stop`, {}
    ).pipe(
      timeout(5000),
      catchError(err => of({ isSuccess: false, message: err.message }))
    );
  }

  getStreamUrl(baseUrl: string, ip: string): Observable<BaseResponse<StreamUrlData>> {
    return this.http.get<BaseResponse<StreamUrlData>>(
      `${baseUrl}/api/yoosee/${encodeURIComponent(ip)}/stream-url`
    ).pipe(
      timeout(5000),
      catchError(err => of({ isSuccess: false, message: err.message }))
    );
  }
}
