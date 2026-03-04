import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  refreshInterval = 30;
  useMockData = true;

  clearHosts(): void {
    if (confirm('This will remove all saved hosts. Are you sure?')) {
      localStorage.removeItem('tool_helper_hosts');
      window.location.reload();
    }
  }

  exportConfig(): void {
    const data = localStorage.getItem('tool_helper_hosts') || '[]';
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tool-helper-hosts.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}
