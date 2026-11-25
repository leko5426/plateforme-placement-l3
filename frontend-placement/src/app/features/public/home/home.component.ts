import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  etapes = [
    {
      numero: '01',
      titre: 'Décris ton besoin',
      texte: "Une candidate cherche un poste, un employeur décrit le profil recherché — en deux minutes, sans engagement.",
      icone: 'bi-pencil-square',
    },
    {
      numero: '02',
      titre: 'Un agent qualifie le profil',
      texte: "Chaque agent de placement vérifie, accompagne et met en relation les bonnes personnes de sa zone.",
      icone: 'bi-person-check',
    },
    {
      numero: '03',
      titre: 'La mise en relation se fait',
      texte: 'Échangez directement via la messagerie intégrée, en toute confiance, jusqu\'à l\'embauche.',
      icone: 'bi-chat-heart',
    },
  ];

  publics = [
    {
      titre: 'Vous cherchez un emploi',
      texte: "Créez votre profil, choisissez un agent près de chez vous (ou candidatez librement) et recevez des propositions.",
      cta: 'Créer mon profil',
      lien: '/inscription/candidate',
      icone: 'bi-briefcase',
    },
    {
      titre: 'Vous êtes agent de placement',
      texte: "Obtenez votre espace dédié et votre lien personnalisé pour gérer vos candidates et vos mises en relation.",
      cta: 'Ouvrir mon agence',
      lien: '/inscription/agent',
      icone: 'bi-building',
    },
    {
      titre: 'Vous employez à domicile',
      texte: 'Publiez votre besoin en quelques clics, sans forcément créer de compte, et laissez les agents vous répondre.',
      cta: 'Publier une demande',
      lien: '/annonce/nouvelle',
      icone: 'bi-house-heart',
    },
  ];
}
