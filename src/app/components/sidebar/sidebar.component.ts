import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HostStore } from '../../services';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  hostStore = inject(HostStore);
  hosts$ = this.hostStore.hosts$;

  navItems = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'dns', label: 'Hosts', route: '/hosts' },
    { icon: 'rocket_launch', label: 'Deploy', route: '/deploy' },
    { icon: 'local_shipping', label: 'SPX Tracking', route: '/spx' },
    { icon: 'videocam', label: 'Camera', route: '/camera' },
  ];

  ngOnInit(): void {
    this.hostStore.loadHosts(true);
  }
}
