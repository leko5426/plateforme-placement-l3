import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  constructor(public auth: AuthService, private router: Router) {}

  seDeconnecter() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  espacePersonnel(): string {
    const role = this.auth.role();
    if (role === 'admin') return '/admin';
    if (role === 'agent') return '/agent';
    if (role === 'candidate') return '/candidate';
    return '/';
  }
}
