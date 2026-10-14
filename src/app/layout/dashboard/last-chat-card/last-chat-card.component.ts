import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { AssistantService } from 'app/assistant/business/assistant.service';
import { AssistantMessage } from 'app/assistant/domain/assistant.models';

@Component({
  selector: 'last-chat-card',
  templateUrl: './last-chat-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon]
})
export class LastChatCardComponent {

  private readonly assistantService = inject(AssistantService);

  readonly hasConversation = computed(() =>
    this.assistantService.mensajes().some(m => m.type === 'user')
  );

  readonly lastUserMessage = computed<AssistantMessage | null>(() => {
    const userMessages = this.assistantService.mensajes().filter(m => m.type === 'user');
    return userMessages.length ? userMessages[userMessages.length - 1] : null;
  });

  readonly lastAssistantReply = computed<AssistantMessage | null>(() => {
    const replies = this.assistantService.mensajes()
      .filter(m => m.type === 'assistant' && !this.assistantService.isSeedMessage(m));
    return replies.length ? replies[replies.length - 1] : null;
  });

  openAssistant(): void {
    this.assistantService.openPanel();
  }
}
