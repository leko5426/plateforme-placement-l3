import { Injectable, signal } from '@angular/core';

interface EtatConfirmation {
  titre: string;
  message: string;
  libelleConfirmer: string;
  resolve: (valeur: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly etat = signal<EtatConfirmation | null>(null);

  demander(message: string, titre = 'Confirmer', libelleConfirmer = 'Confirmer'): Promise<boolean> {
    return new Promise((resolve) => {
      this.etat.set({ titre, message, libelleConfirmer, resolve });
    });
  }

  repondre(valeur: boolean) {
    this.etat()?.resolve(valeur);
    this.etat.set(null);
  }
}
