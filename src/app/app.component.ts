import { Component, OnInit, HostListener, ChangeDetectionStrategy, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LoginService } from './authentication/login.service';
import { AssistantButtonComponent } from './assistant/components/assistant-button/assistant-button.component';
import { AssistantPanelComponent } from './assistant/components/assistant-panel/assistant-panel.component';
import { AssistantService } from './assistant/business/assistant.service';
import { LayoutService } from './layout/layout.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterOutlet, AssistantButtonComponent, AssistantPanelComponent]
})
export class AppComponent implements OnInit {
  title = inject(Title);
  private router = inject(Router);
  private layoutService = inject(LayoutService);
  public assistantService = inject(AssistantService);


  ngOnInit() {
    this.changePageTitle();
  }

  changePageTitle() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((routeChange) => {
      if (!this.layoutService || !this.layoutService.company() || !this.layoutService.company().nombre) {
        this.title.setTitle("d3-apps.com");
      } else {
        this.title.setTitle(this.layoutService.company().nombre);
      }
    });
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    const result = confirm("Quieres refrescar la pagina.");
    if (result) {
      return true;
    }
    return false; // stay on same page
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'F9') {
      event.preventDefault();
      this.assistantService.togglePanel();
    }
  }
}