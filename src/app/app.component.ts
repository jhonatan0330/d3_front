import { Component, OnInit, HostListener, ChangeDetectionStrategy, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LoginService } from './authentication/login.service';
import { AssistantButtonComponent } from './assistant/assistant-button/assistant-button.component';
import { AssistantService } from './assistant/assistant.service';
import { AssistantDialogComponent } from './assistant/assistant-dialog/assistant-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterOutlet, AssistantButtonComponent]
})
export class AppComponent implements OnInit {
  title = inject(Title);
  private router = inject(Router);
  private jwtAut = inject(LoginService);
  public assistantService = inject(AssistantService);
  private dialog = inject(MatDialog);


  ngOnInit() {
    this.changePageTitle();
  }

  changePageTitle() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((routeChange) => {
      if (!this.jwtAut || !this.jwtAut.company() || !this.jwtAut.company().nombre) {
        this.title.setTitle("d3-apps.com");
      } else {
        this.title.setTitle(this.jwtAut.company().nombre);
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
      if (this.assistantService.isOpenDialog()) {
        this.dialog.open(AssistantDialogComponent, {
          width: '600px',
          maxWidth: '95vw',
          height: '700px',
          maxHeight: '90vh',
          disableClose: true,
          panelClass: 'assistant-dialog-panel',
        });
      }
    }
  }
}
