import { Component, OnInit, HostListener } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LoginService } from './authentication/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  /**
   * Constructor
   */
  constructor(
    public title: Title,
    private router: Router,
    private jwtAut: LoginService
  ) {
  }

  ngOnInit() {
    this.changePageTitle();
  }

  changePageTitle() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((routeChange) => {
      if (!this.jwtAut || !this.jwtAut.company || !this.jwtAut.company.nombre) {
        this.title.setTitle("Software para ti");
      } else {
        this.title.setTitle(this.jwtAut.company.nombre);
      }
    });
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    let result = confirm("Quieres refrescar la pagina.");
    if (result) {
      return true;
    }
    return false; // stay on same page
  }
}
