import { Component, ElementRef, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConversationService } from '../../core/services/conversation.service';
import { AuthService } from '../../core/services/auth.service';
import { Conversation, User } from '../../core/models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('zoneMessages') zoneMessages?: ElementRef<HTMLDivElement>;

  conversations = signal<Conversation[]>([]);
  conversationActive = signal<Conversation | null>(null);
  chargement = signal(true);
  brouillon = '';

  constructor(
    public conversationService: ConversationService,
    public auth: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.conversationService.connecter();
    this.chargerConversations();
  }

  ngOnDestroy() {
    this.conversationService.deconnecter();
  }

  chargerConversations() {
    this.conversationService.lister().subscribe({
      next: (liste) => {
        const monId = this.auth.utilisateur()?._id;
        const vues = new Set<string>();
        const listeUnique = liste.filter((conv) => {
          const autre = conv.participants.find((p) => p._id !== monId);
          const cle = autre ? autre._id : conv._id;
          if (vues.has(cle)) return false;
          vues.add(cle);
          return true;
        });

        this.conversations.set(listeUnique);
        this.chargement.set(false);

        const idDemande = this.route.snapshot.queryParamMap.get('conv');
        const contactDemande =
          this.route.snapshot.queryParamMap.get('nouveauContact') ||
          this.route.snapshot.queryParamMap.get('userId');

        if (idDemande) {
          const aOuvrir = listeUnique.find((c) => c._id === idDemande) ?? listeUnique[0];
          if (aOuvrir) this.ouvrirConversation(aOuvrir);
        } else if (contactDemande) {
          const convExistante = listeUnique.find((c) =>
            c.participants.some((p) => p._id === contactDemande)
          );

          if (convExistante) {
            this.ouvrirConversation(convExistante);
          } else {
            this.conversationService.demarrerConversation(contactDemande).subscribe({
              next: (nouvelleConv) => {
                this.conversations.update((convs) => [nouvelleConv, ...convs]);
                this.ouvrirConversation(nouvelleConv);
              },
              error: (err) => {
                console.error('Erreur lors de la création de la conversation', err);
                if (listeUnique.length > 0) this.ouvrirConversation(listeUnique[0]);
              },
            });
          }
        } else if (listeUnique.length > 0) {
          this.ouvrirConversation(listeUnique[0]);
        }
      },
      error: () => this.chargement.set(false),
    });
  }

  ouvrirConversation(conversation: Conversation) {
    this.conversationActive.set(conversation);
    this.conversationService.rejoindreConversation(conversation._id);
    this.conversationService.obtenirMessages(conversation._id).subscribe(() => {
      setTimeout(() => this.descendreEnBas(), 100);
    });
  }

  autreParticipant(conversation: Conversation): User | undefined {
    return conversation.participants.find((p) => p._id !== this.auth.utilisateur()?._id);
  }

  envoyer() {
    const conversation = this.conversationActive();
    if (!conversation || !this.brouillon.trim()) return;

    this.conversationService.envoyerMessage(conversation._id, this.brouillon.trim());
    this.brouillon = '';
    setTimeout(() => this.descendreEnBas(), 100);
  }

  surFrappe() {
    const conversation = this.conversationActive();
    if (conversation) this.conversationService.signalerFrappe(conversation._id);
  }

  private descendreEnBas() {
    if (this.zoneMessages) {
      this.zoneMessages.nativeElement.scrollTop = this.zoneMessages.nativeElement.scrollHeight;
    }
  }

  estMoi(expediteurId: string): boolean {
    return expediteurId === this.auth.utilisateur()?._id;
  }
}