import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HostStore } from '../../services';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private hostStore = inject(HostStore);

  refreshInterval = 30;
  apiUrl = environment.hostManagementApiUrl;

  exportConfig(): void {
    const hosts = this.hostStore.getHosts();
    const config = { apiUrl: this.apiUrl, hosts };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tool-helper-config.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}
