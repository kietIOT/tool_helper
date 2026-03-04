import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Host, DeployRequest, DeployResponse } from '../../models';
import { HostStore, HostApiService } from '../../services';

@Component({
  selector: 'app-deploy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deploy.component.html',
  styleUrl: './deploy.component.scss',
})
export class DeployComponent implements OnInit, OnDestroy {
  private hostStore = inject(HostStore);
  private api = inject(HostApiService);
  private destroy$ = new Subject<void>();

  hosts: Host[] = [];
  selectedHostId = '';
  deploying = false;
  result: DeployResponse | null = null;

  form: DeployRequest = {
    serviceName: '',
    image: '',
    tag: 'latest',
    ports: [],
    envVars: {},
    volumes: [],
    restart: 'unless-stopped',
  };

  portsInput = '';
  volumesInput = '';
  envInput = '';

  ngOnInit(): void {
    this.hostStore.hosts$.pipe(takeUntil(this.destroy$)).subscribe(hosts => {
      this.hosts = hosts;
      if (hosts.length > 0 && !this.selectedHostId) {
        this.selectedHostId = hosts[0].id;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get selectedHost(): Host | undefined {
    return this.hosts.find(h => h.id === this.selectedHostId);
  }

  deploy(): void {
    const host = this.selectedHost;
    if (!host || !this.form.serviceName || !this.form.image) return;

    this.form.ports = this.portsInput.split(',').map(p => p.trim()).filter(Boolean);
    this.form.volumes = this.volumesInput.split(',').map(v => v.trim()).filter(Boolean);

    // Parse env vars
    const envVars: Record<string, string> = {};
    this.envInput.split('\n').forEach(line => {
      const idx = line.indexOf('=');
      if (idx > 0) {
        envVars[line.substring(0, idx).trim()] = line.substring(idx + 1).trim();
      }
    });
    this.form.envVars = envVars;

    this.deploying = true;
    this.result = null;

    // Mock deploy for demo
    setTimeout(() => {
      this.result = {
        success: true,
        message: `Service "${this.form.serviceName}" deployed successfully on ${host.name}`,
        containerId: 'sha256:' + Math.random().toString(36).substring(2, 14),
      };
      this.deploying = false;
    }, 2000);

    // Real API:
    // this.api.deploy(host, this.form).pipe(takeUntil(this.destroy$)).subscribe(res => {
    //   this.result = res;
    //   this.deploying = false;
    // });
  }

  resetForm(): void {
    this.form = {
      serviceName: '',
      image: '',
      tag: 'latest',
      ports: [],
      envVars: {},
      volumes: [],
      restart: 'unless-stopped',
    };
    this.portsInput = '';
    this.volumesInput = '';
    this.envInput = '';
    this.result = null;
  }
}
