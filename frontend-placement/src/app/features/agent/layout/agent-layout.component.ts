import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-agent-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './agent-layout.component.html',
  styleUrl: './agent-layout.component.scss',
})
export class AgentLayoutComponent {
  constructor(public auth: AuthService) {}

  liens = [
    { lien: 'tableau-de-bord', icone: 'bi-speedometer2', libelle: 'Tableau de bord' },
    { lien: 'profil', icone: 'bi-building', libelle: 'Mon agence' },
    { lien: 'candidates', icone: 'bi-people', libelle: 'Mes candidates' },
    { lien: 'candidatures', icone: 'bi-inbox', libelle: 'Candidatures reçues' },
    { lien: 'messages', icone: 'bi-chat-dots', libelle: 'Messagerie' },
        { lien: 'demandes', icone: 'bi-megaphone', libelle: "Demandes d'employeurs" },
  ];
}
