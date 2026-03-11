import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, interval } from 'rxjs';
import {
  HostDto,
  SpxTrackingData,
  ShipmentStatusData,
  ActiveShipmentItem,
  TrackingStatus,
} from '../../models';
import { HostStore, ToolHelperApiService } from '../../services';

@Component({
  selector: 'app-spx-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './spx-tracking.component.html',
  styleUrl: './spx-tracking.component.scss',
})
export class SpxTrackingComponent implements OnInit, OnDestroy {
  private hostStore = inject(HostStore);
  private api = inject(ToolHelperApiService);
  private destroy$ = new Subject<void>();

  hosts: HostDto[] = [];
  selectedHostId = '';
  activeTab: 'lookup' | 'tracking' = 'tracking';

  // Lookup
  lookupOrderId = '';
  lookupLoading = false;
  lookupResult: SpxTrackingData | null = null;
  lookupError = '';

  // Tracking
  subscribeInput = '';
  subscribing = false;
  subscribeMessage = '';
  activeShipments: ActiveShipmentItem[] = [];
  loadingActive = false;
  polling = false;

  // Status detail
  selectedShipment: ShipmentStatusData | null = null;
  loadingDetail = false;

  ngOnInit(): void {
    this.hostStore.hosts$.pipe(takeUntil(this.destroy$)).subscribe(hosts => {
      this.hosts = hosts;
      if (hosts.length > 0 && !this.selectedHostId) {
        this.selectedHostId = hosts[0].id;
        this.loadActiveShipments();
      }
    });

    // Auto-refresh active shipments every 60 seconds
    interval(60000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.activeTab === 'tracking') this.loadActiveShipments();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get selectedHost(): HostDto | undefined {
    return this.hosts.find(h => h.id === this.selectedHostId);
  }

  private getAgentUrl(host: HostDto): string {
    return `http://${host.ipAddress}:${host.agentPort}`;
  }

  onHostChange(): void {
    this.lookupResult = null;
    this.selectedShipment = null;
    this.activeShipments = [];
    this.loadActiveShipments();
  }

  // === Lookup ===

  lookup(): void {
    const host = this.selectedHost;
    if (!host || !this.lookupOrderId.trim()) return;

    this.lookupLoading = true;
    this.lookupResult = null;
    this.lookupError = '';

    this.api.spxLookup(this.getAgentUrl(host), this.lookupOrderId.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (res.isSuccess && res.data) {
          this.lookupResult = res.data;
        } else {
          this.lookupError = res.message || 'Lookup failed';
        }
        this.lookupLoading = false;
      });
  }

  formatTimestamp(ts: number): string {
    return new Date(ts * 1000).toLocaleString('vi-VN');
  }

  // === Tracking ===

  subscribe(): void {
    const host = this.selectedHost;
    if (!host || !this.subscribeInput.trim()) return;

    this.subscribing = true;
    this.subscribeMessage = '';

    this.api.spxSubscribe(this.getAgentUrl(host), this.subscribeInput.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.subscribeMessage = res.message || (res.isSuccess ? 'Subscribed!' : 'Failed');
        this.subscribing = false;
        if (res.isSuccess) {
          this.subscribeInput = '';
          this.loadActiveShipments();
        }
      });
  }

  unsubscribe(spxTn: string): void {
    const host = this.selectedHost;
    if (!host) return;

    this.api.spxUnsubscribe(this.getAgentUrl(host), spxTn)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadActiveShipments();
        if (this.selectedShipment?.spxTn === spxTn) {
          this.selectedShipment = null;
        }
      });
  }

  loadActiveShipments(): void {
    const host = this.selectedHost;
    if (!host) return;

    this.loadingActive = true;
    this.api.spxGetActive(this.getAgentUrl(host))
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.activeShipments = res.isSuccess && res.data ? res.data : [];
        this.loadingActive = false;
      });
  }

  viewStatus(spxTn: string): void {
    const host = this.selectedHost;
    if (!host) return;

    this.loadingDetail = true;
    this.selectedShipment = null;

    this.api.spxGetStatus(this.getAgentUrl(host), spxTn)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (res.isSuccess && res.data) {
          this.selectedShipment = res.data;
        }
        this.loadingDetail = false;
      });
  }

  closeDetail(): void {
    this.selectedShipment = null;
  }

  triggerPoll(): void {
    const host = this.selectedHost;
    if (!host) return;

    this.polling = true;
    this.api.spxTriggerPoll(this.getAgentUrl(host))
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.polling = false;
        this.loadActiveShipments();
      });
  }

  getStatusColor(status: TrackingStatus): string {
    switch (status) {
      case 'Delivered': return '#22c55e';
      case 'InTransit': return '#3b82f6';
      case 'OutForDelivery': return '#f59e0b';
      case 'Preparing': return '#6b7280';
      case 'Cancelled': return '#ef4444';
      case 'Returned': return '#ef4444';
      case 'Exception': return '#ef4444';
      default: return '#6b7280';
    }
  }

  getStatusIcon(status: TrackingStatus): string {
    switch (status) {
      case 'Delivered': return 'check_circle';
      case 'InTransit': return 'local_shipping';
      case 'OutForDelivery': return 'directions_bike';
      case 'Preparing': return 'inventory_2';
      case 'Cancelled': return 'cancel';
      case 'Returned': return 'undo';
      case 'Exception': return 'warning';
      default: return 'help';
    }
  }
}
