import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  constructor(public auth: AuthService) {}

  liens = [
    { lien: 'tableau-de-bord', icone: 'bi-speedometer2', libelle: 'Tableau de bord' },
    { lien: 'agents', icone: 'bi-building', libelle: 'Validation des agents' },
    { lien: 'utilisateurs', icone: 'bi-people', libelle: 'Utilisateurs' },
    { lien: 'signalements', icone: 'bi-flag', libelle: 'Signalements' },
    { lien: 'demandes', icone: 'bi-megaphone', libelle: "Demandes d'employeurs" },
  ];
}
