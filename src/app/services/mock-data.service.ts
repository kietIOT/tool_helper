import { Injectable } from '@angular/core';
import { HostStats, DockerService, Host } from '../models';

/**
 * Provides mock data for development when backends are not available.
 * Replace real API calls with these for local testing.
 */
@Injectable({ providedIn: 'root' })
export class MockDataService {

  getMockStats(): HostStats {
    return {
      cpuUsage: Math.round(Math.random() * 80 + 5),
      cpuCores: 8,
      memoryUsed: Math.round((Math.random() * 10 + 2) * 1024 * 1024 * 1024),
      memoryTotal: 16 * 1024 * 1024 * 1024,
      diskUsed: Math.round((Math.random() * 300 + 50) * 1024 * 1024 * 1024),
      diskTotal: 500 * 1024 * 1024 * 1024,
      networkIn: Math.round(Math.random() * 50 * 1024 * 1024),
      networkOut: Math.round(Math.random() * 20 * 1024 * 1024),
      uptime: '15 days, 7 hours',
      loadAverage: [
        +(Math.random() * 4).toFixed(2),
        +(Math.random() * 3).toFixed(2),
        +(Math.random() * 2).toFixed(2),
      ],
    };
  }

  getMockServices(hostName: string): DockerService[] {
    const services: DockerService[] = [
      {
        id: 'svc-' + Math.random().toString(36).substring(2, 14),
        name: 'nginx-proxy',
        image: 'nginx:1.25-alpine',
        status: 'running',
        state: 'Up 5 days',
        ports: ['80:80', '443:443'],
        createdAt: '2026-02-20T10:00:00Z',
        uptime: '5 days',
        cpuUsage: +(Math.random() * 5).toFixed(1),
        memoryUsage: 50 * 1024 * 1024,
        memoryLimit: 256 * 1024 * 1024,
        networkIn: 1024 * 1024 * 200,
        networkOut: 1024 * 1024 * 500,
        volumes: ['/etc/nginx/conf.d'],
        labels: { 'com.docker.compose.service': 'nginx' },
        restartCount: 0,
      },
      {
        id: 'svc-' + Math.random().toString(36).substring(2, 14),
        name: 'api-gateway',
        image: 'node:20-alpine',
        status: 'running',
        state: 'Up 3 days',
        ports: ['3000:3000'],
        createdAt: '2026-02-22T08:30:00Z',
        uptime: '3 days',
        cpuUsage: +(Math.random() * 30).toFixed(1),
        memoryUsage: 200 * 1024 * 1024,
        memoryLimit: 512 * 1024 * 1024,
        networkIn: 1024 * 1024 * 50,
        networkOut: 1024 * 1024 * 80,
        volumes: ['/app/logs'],
        labels: { 'com.docker.compose.service': 'api' },
        restartCount: 1,
      },
      {
        id: 'svc-' + Math.random().toString(36).substring(2, 14),
        name: 'postgres-db',
        image: 'postgres:16',
        status: 'running',
        state: 'Up 10 days',
        ports: ['5432:5432'],
        createdAt: '2026-02-15T06:00:00Z',
        uptime: '10 days',
        cpuUsage: +(Math.random() * 15).toFixed(1),
        memoryUsage: 400 * 1024 * 1024,
        memoryLimit: 1024 * 1024 * 1024,
        networkIn: 1024 * 1024 * 10,
        networkOut: 1024 * 1024 * 30,
        volumes: ['/var/lib/postgresql/data'],
        labels: { 'com.docker.compose.service': 'db' },
        restartCount: 0,
      },
      {
        id: 'svc-' + Math.random().toString(36).substring(2, 14),
        name: 'redis-cache',
        image: 'redis:7-alpine',
        status: 'running',
        state: 'Up 10 days',
        ports: ['6379:6379'],
        createdAt: '2026-02-15T06:00:00Z',
        uptime: '10 days',
        cpuUsage: +(Math.random() * 3).toFixed(1),
        memoryUsage: 80 * 1024 * 1024,
        memoryLimit: 256 * 1024 * 1024,
        networkIn: 1024 * 1024 * 5,
        networkOut: 1024 * 1024 * 8,
        volumes: [],
        labels: { 'com.docker.compose.service': 'redis' },
        restartCount: 0,
      },
      {
        id: 'svc-' + Math.random().toString(36).substring(2, 14),
        name: 'worker-service',
        image: 'python:3.12-slim',
        status: 'stopped',
        state: 'Exited (0) 2 hours ago',
        ports: [],
        createdAt: '2026-02-25T14:00:00Z',
        uptime: '0',
        cpuUsage: 0,
        memoryUsage: 0,
        memoryLimit: 512 * 1024 * 1024,
        networkIn: 0,
        networkOut: 0,
        volumes: ['/app/data'],
        labels: { 'com.docker.compose.service': 'worker' },
        restartCount: 3,
      },
    ];
    return services;
  }
}
