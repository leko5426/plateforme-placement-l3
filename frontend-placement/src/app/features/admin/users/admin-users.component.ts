import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
})
export class AdminUsersComponent implements OnInit {
  users = signal<User[]>([]);
  chargement = signal(true);
  filtreRole = signal('');

  constructor(
    private adminService: AdminService,
    private notification: NotificationService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit() {
    this.charger();
  }

  charger() {
    this.chargement.set(true);
    this.adminService.listerUtilisateurs(this.filtreRole() || undefined).subscribe({
      next: (u) => {
        this.users.set(u);
        this.chargement.set(false);
      },
      error: () => this.chargement.set(false),
    });
  }

  filtrer(role: string) {
    this.filtreRole.set(role);
    this.charger();
  }

  async basculerStatut(user: User) {
    const action = user.actif ? 'désactiver' : 'réactiver';
    const confirme = await this.confirmDialog.demander(
      `Confirmer vouloir ${action} le compte de "${user.nom}" ?`,
      'Statut du compte',
      user.actif ? 'Désactiver' : 'Réactiver'
    );
    if (!confirme) return;

    this.adminService.changerStatutUtilisateur(user._id, !user.actif).subscribe({
      next: (maj) => {
        this.users.update((liste) => liste.map((u) => (u._id === maj._id ? maj : u)));
        this.notification.succes('Statut du compte mis à jour.');
      },
    });
  }
}
