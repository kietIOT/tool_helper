import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { HostDto, CreateHostRequest, UpdateHostRequest } from '../../models';
import { HostStore, HostManagementApiService } from '../../services';

@Component({
  selector: 'app-hosts-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './hosts-list.component.html',
  styleUrl: './hosts-list.component.scss',
})
export class HostsListComponent implements OnInit, OnDestroy {
  private hostStore = inject(HostStore);
  private api = inject(HostManagementApiService);
  private destroy$ = new Subject<void>();

  hosts: HostDto[] = [];
  showAddForm = false;
  editingHost: HostDto | null = null;
  saving = false;

  formData: CreateHostRequest = {
    name: '',
    ipAddress: '',
    description: '',
    agentPort: 5155,
    sshPort: 22,
    sshUsername: '',
    os: '',
  };

  ngOnInit(): void {
    this.hostStore.hosts$.pipe(takeUntil(this.destroy$)).subscribe(hosts => {
      this.hosts = hosts;
    });
    this.hostStore.loadHosts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openAddForm(): void {
    this.formData = { name: '', ipAddress: '', description: '', agentPort: 5155, sshPort: 22, sshUsername: '', os: '' };
    this.editingHost = null;
    this.showAddForm = true;
  }

  openEditForm(host: HostDto): void {
    this.formData = {
      name: host.name,
      ipAddress: host.ipAddress,
      description: host.description,
      agentPort: host.agentPort,
      sshPort: host.sshPort,
      sshUsername: host.sshUsername,
      os: host.os,
    };
    this.editingHost = host;
    this.showAddForm = true;
  }

  closeForm(): void {
    this.showAddForm = false;
    this.editingHost = null;
  }

  saveHost(): void {
    if (!this.formData.name || !this.formData.ipAddress) return;
    this.saving = true;

    if (this.editingHost) {
      const req: UpdateHostRequest = {
        name: this.formData.name,
        ipAddress: this.formData.ipAddress,
        description: this.formData.description,
        agentPort: this.formData.agentPort,
        sshPort: this.formData.sshPort,
        sshUsername: this.formData.sshUsername,
        os: this.formData.os,
      };
      this.api.updateHost(this.editingHost.id, req).pipe(takeUntil(this.destroy$)).subscribe(res => {
        this.saving = false;
        if (res.isSuccess) {
          this.closeForm();
          this.hostStore.loadHosts();
        } else {
          alert(res.message || 'Update failed');
        }
      });
    } else {
      this.api.createHost(this.formData).pipe(takeUntil(this.destroy$)).subscribe(res => {
        this.saving = false;
        if (res.isSuccess) {
          this.closeForm();
          this.hostStore.loadHosts();
        } else {
          alert(res.message || 'Create failed');
        }
      });
    }
  }

  deleteHost(host: HostDto): void {
    if (confirm(`Are you sure you want to remove "${host.name}"? All services and deployment histories will be deleted.`)) {
      this.api.deleteHost(host.id).pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (res.isSuccess) {
          this.hostStore.loadHosts();
        } else {
          alert(res.message || 'Delete failed');
        }
      });
    }
  }
}
