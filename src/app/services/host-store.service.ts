import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Host, HostFormData } from '../models';

const STORAGE_KEY = 'tool_helper_hosts';

@Injectable({ providedIn: 'root' })
export class HostStore {
  private hostsSubject = new BehaviorSubject<Host[]>(this.loadHosts());

  hosts$ = this.hostsSubject.asObservable();

  private loadHosts(): Host[] {
    if (typeof localStorage === 'undefined') return this.getDefaultHosts();
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : this.getDefaultHosts();
    } catch {
      return this.getDefaultHosts();
    }
  }

  private saveHosts(hosts: Host[]): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hosts));
    }
    this.hostsSubject.next(hosts);
  }

  private getDefaultHosts(): Host[] {
    return [
      {
        id: 'host-1',
        name: 'Production Server',
        url: 'http://192.168.1.10:3000',
        ip: '192.168.1.10',
        status: 'unknown',
        description: 'Main production server',
      },
      {
        id: 'host-2',
        name: 'Staging Server',
        url: 'http://192.168.1.11:3000',
        ip: '192.168.1.11',
        status: 'unknown',
        description: 'Staging / QA environment',
      },
      {
        id: 'host-3',
        name: 'Dev Server',
        url: 'http://192.168.1.12:3000',
        ip: '192.168.1.12',
        status: 'unknown',
        description: 'Development & testing',
      },
    ];
  }

  getHosts(): Host[] {
    return this.hostsSubject.getValue();
  }

  getHostById(id: string): Host | undefined {
    return this.getHosts().find(h => h.id === id);
  }

  addHost(data: HostFormData): Host {
    const host: Host = {
      id: 'host-' + Date.now(),
      name: data.name,
      url: data.url,
      ip: data.ip,
      description: data.description,
      status: 'unknown',
    };
    const hosts = [...this.getHosts(), host];
    this.saveHosts(hosts);
    return host;
  }

  updateHost(id: string, data: Partial<HostFormData>): void {
    const hosts = this.getHosts().map(h =>
      h.id === id ? { ...h, ...data } : h
    );
    this.saveHosts(hosts);
  }

  updateHostStatus(id: string, status: Host['status']): void {
    const hosts = this.getHosts().map(h =>
      h.id === id ? { ...h, status, lastChecked: new Date().toISOString() } : h
    );
    this.saveHosts(hosts);
  }

  removeHost(id: string): void {
    const hosts = this.getHosts().filter(h => h.id !== id);
    this.saveHosts(hosts);
  }
}
