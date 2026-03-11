import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { HostStore, ToolHelperApiService } from '../../services';
import { HostDto, BaseResponse, StreamUrlData } from '../../models';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.scss',
})
export class CameraComponent implements OnInit, OnDestroy {
  private hostStore = inject(HostStore);
  private api = inject(ToolHelperApiService);
  private destroy$ = new Subject<void>();

  hosts: HostDto[] = [];
  selectedHostId = '';
  cameraIp = '';
  mode: 'continuous' | 'step' = 'step';
  actions: string[] = [];
  streamUrl = '';
  statusMsg = '';
  loading = false;
  loadingActions = false;
  activeAction = '';

  get selectedHost(): HostDto | undefined {
    return this.hosts.find(h => h.id === this.selectedHostId);
  }

  private getAgentUrl(host: HostDto): string {
    return `http://${host.ipAddress}:${host.agentPort}`;
  }

  ngOnInit(): void {
    this.hostStore.hosts$.pipe(takeUntil(this.destroy$)).subscribe(hosts => {
      this.hosts = hosts;
      if (!this.selectedHostId && hosts.length > 0) {
        this.selectedHostId = hosts[0].id;
        this.loadActions();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onHostChange(): void {
    this.loadActions();
    this.streamUrl = '';
  }

  loadActions(): void {
    const host = this.selectedHost;
    if (!host) return;
    this.loadingActions = true;
    this.api.getCameraActions(this.getAgentUrl(host)).pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.loadingActions = false;
      if (res.isSuccess && res.data) {
        this.actions = res.data;
      }
    });
  }

  move(action: string): void {
    const host = this.selectedHost;
    if (!host || !this.cameraIp) return;
    this.activeAction = action;
    this.statusMsg = '';

    const url = this.getAgentUrl(host);
    const call = this.mode === 'step'
      ? this.api.moveCameraAndStop(url, this.cameraIp, action)
      : this.api.moveCamera(url, this.cameraIp, action);

    call.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.activeAction = '';
      this.statusMsg = res.isSuccess ? `Moved ${action}` : (res.message ?? 'Move failed');
    });
  }

  stop(): void {
    const host = this.selectedHost;
    if (!host || !this.cameraIp) return;
    this.activeAction = 'stop';
    this.api.stopCamera(this.getAgentUrl(host), this.cameraIp).pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.activeAction = '';
      this.statusMsg = res.isSuccess ? 'Stopped' : (res.message ?? 'Stop failed');
    });
  }

  fetchStreamUrl(): void {
    const host = this.selectedHost;
    if (!host || !this.cameraIp) return;
    this.loading = true;
    this.api.getStreamUrl(this.getAgentUrl(host), this.cameraIp).pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.loading = false;
      if (res.isSuccess && res.data) {
        this.streamUrl = res.data.streamUrl;
      } else {
        this.statusMsg = res.message ?? 'Failed to get stream URL';
      }
    });
  }

  copyStreamUrl(): void {
    if (this.streamUrl) {
      navigator.clipboard.writeText(this.streamUrl);
      this.statusMsg = 'Stream URL copied!';
    }
  }

  get ptzActions(): { icon: string; label: string; action: string }[] {
    return [
      { icon: 'arrow_upward', label: 'Up', action: 'up' },
      { icon: 'arrow_downward', label: 'Down', action: 'down' },
      { icon: 'arrow_back', label: 'Left', action: 'left' },
      { icon: 'arrow_forward', label: 'Right', action: 'right' },
    ];
  }
}
