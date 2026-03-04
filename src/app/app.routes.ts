import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'hosts',
        loadComponent: () =>
          import('./pages/hosts-list/hosts-list.component').then(m => m.HostsListComponent),
      },
      {
        path: 'hosts/:id',
        loadComponent: () =>
          import('./pages/host-detail/host-detail.component').then(m => m.HostDetailComponent),
      },
      {
        path: 'deploy',
        loadComponent: () =>
          import('./pages/deploy/deploy.component').then(m => m.DeployComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings.component').then(m => m.SettingsComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
