import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Host, HostFormData } from '../../models';
import { HostStore } from '../../services';

@Component({
  selector: 'app-hosts-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './hosts-list.component.html',
  styleUrl: './hosts-list.component.scss',
})
export class HostsListComponent implements OnInit, OnDestroy {
  private hostStore = inject(HostStore);
  private destroy$ = new Subject<void>();

  hosts: Host[] = [];
  showAddForm = false;
  editingHost: Host | null = null;

  formData: HostFormData = { name: '', url: '', ip: '', description: '' };

  ngOnInit(): void {
    this.hostStore.hosts$.pipe(takeUntil(this.destroy$)).subscribe(hosts => {
      this.hosts = hosts;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openAddForm(): void {
    this.formData = { name: '', url: '', ip: '', description: '' };
    this.editingHost = null;
    this.showAddForm = true;
  }

  openEditForm(host: Host): void {
    this.formData = { name: host.name, url: host.url, ip: host.ip, description: host.description };
    this.editingHost = host;
    this.showAddForm = true;
  }

  closeForm(): void {
    this.showAddForm = false;
    this.editingHost = null;
  }

  saveHost(): void {
    if (!this.formData.name || !this.formData.url || !this.formData.ip) return;

    if (this.editingHost) {
      this.hostStore.updateHost(this.editingHost.id, this.formData);
    } else {
      this.hostStore.addHost(this.formData);
    }
    this.closeForm();
  }

  deleteHost(host: Host): void {
    if (confirm(`Are you sure you want to remove "${host.name}"?`)) {
      this.hostStore.removeHost(host.id);
    }
  }
}
