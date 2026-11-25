import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="app-footer">
      <div class="container py-5">
        <div class="row g-4">
          <div class="col-md-4">
            <div class="d-flex align-items-center gap-2 mb-3">
              <span class="brand-mark"><i class="bi bi-house-heart-fill"></i></span>
              <span class="brand-name">Aide<span class="text-accent">Menagere</span></span>
            </div>
            <p class="text-white-50 mb-0">
              La plateforme qui met en relation candidates, agents de placement et employeurs
              pour l'emploi à domicile en Côte d'Ivoire.
            </p>
          </div>
          <div class="col-6 col-md-2">
            <h6 class="footer-title">Découvrir</h6>
            <ul class="list-unstyled footer-links">
              <li><a routerLink="/agences">Agences</a></li>
              <li><a routerLink="/candidates">Candidates</a></li>
              <li><a routerLink="/annonce/nouvelle">Publier un besoin</a></li>
            </ul>
          </div>
          <div class="col-6 col-md-3">
            <h6 class="footer-title">Rejoindre</h6>
            <ul class="list-unstyled footer-links">
              <li><a routerLink="/inscription/candidate">Je cherche un emploi</a></li>
              <li><a routerLink="/inscription/agent">Je suis agent de placement</a></li>
              <li><a routerLink="/connexion">Connexion</a></li>
            </ul>
          </div>
          <div class="col-md-3">
            <h6 class="footer-title">Contact</h6>
            <p class="text-white-50 mb-1"><i class="bi bi-envelope me-2"></i>contact&#64;plateforme.ci</p>
            <p class="text-white-50"><i class="bi bi-geo-alt me-2"></i>Abidjan, Côte d'Ivoire</p>
          </div>
        </div>
        <div class="brand-rule brand-rule--wide my-4 opacity-50"></div>
        <p class="text-white-50 small mb-0 text-center">
          &copy; {{ annee }} AideMenagere. Tous droits réservés.
        </p>
      </div>
    </footer>
  `,
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  annee = new Date().getFullYear();
}
