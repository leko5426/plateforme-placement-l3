import { Component, Input, computed, signal } from '@angular/core';

const LIBELLES: Record<string, string> = {
  en_attente: 'En attente',
  verifiee: 'Vérifiée',
  archivee: 'Archivée',
  placee: 'Placée',
  valide: 'Validé',
  rejete: 'Rejeté',
  nouvelle: 'Nouvelle',
  en_traitement: 'En traitement',
  cloturee: 'Clôturée',
  acceptee: 'Acceptée',
  refusee: 'Refusée',
  traite: 'Traité',
};

const VARIANTES: Record<string, string> = {
  en_attente: 'attente',
  verifiee: 'succes',
  valide: 'succes',
  acceptee: 'succes',
  placee: 'succes',
  traite: 'succes',
  archivee: 'neutre',
  cloturee: 'neutre',
  rejete: 'danger',
  refusee: 'danger',
  nouvelle: 'neutre',
  en_traitement: 'attente',
};

@Component({
  selector: 'app-star-badge',
  standalone: true,
  template: `<span class="badge-statut" [class]="'badge-statut--' + variante()">{{ libelle() }}</span>`,
})
export class StarBadgeComponent {
  private valeur = signal('');

  @Input() set statut(val: string) {
    this.valeur.set(val);
  }

  libelle = computed(() => LIBELLES[this.valeur()] ?? this.valeur());
  variante = computed(() => VARIANTES[this.valeur()] ?? 'neutre');
}
