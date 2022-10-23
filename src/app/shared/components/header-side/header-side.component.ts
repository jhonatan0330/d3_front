import { Component, OnInit, Input } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { LayoutService } from '../../services/layout.service';
import { JwtAuthService } from '../../services/auth/jwt-auth.service';
import { TemplateService } from 'app/service/template.service';
import { ApiService } from 'app/service/api.service';
import { UtilsService } from 'app/service/utils.service';
import { NotificacionService } from 'app/service/notificacion.service';

@Component({
  selector: 'app-header-side',
  templateUrl: './header-side.template.html',
})
export class HeaderSideComponent implements OnInit {
  @Input() notificPanel;
  // @Input() indicatorPanel;

  public egretThemes;
  public layoutConf: any;
  constructor(
    private themeService: ThemeService,
    private layout: LayoutService,
    public jwtAuth: JwtAuthService,
    public notificationService: NotificacionService,
    public templateService: TemplateService,
    private apiService: ApiService,
    private utilService: UtilsService
  ) {}
  ngOnInit() {
    this.egretThemes = this.themeService.egretThemes;
    this.layoutConf = this.layout.layoutConf;
  }

  toggleNotific() {
    this.notificPanel.toggle();
  }

  /*toggleIndicadores() {
    this.indicatorPanel.toggle();
  }*/

  toggleSidenav() {
    if (this.layoutConf.sidebarStyle === 'closed') {
      return this.layout.publishLayoutChange({
        sidebarStyle: 'full',
      });
    }
    this.layout.publishLayoutChange({
      sidebarStyle: 'closed',
    });
  }

  toggleCollapse() {
    // compact --> full
    if (this.layoutConf.sidebarStyle === 'compact') {
      return this.layout.publishLayoutChange(
        {
          sidebarStyle: 'full',
          sidebarCompactToggle: false,
        },
        { transitionClass: true }
      );
    }

    // * --> compact
    this.layout.publishLayoutChange(
      {
        sidebarStyle: 'compact',
        sidebarCompactToggle: true,
      },
      { transitionClass: true }
    );
  }

  onSearch(e) {
    //   console.log(e)
  }

  logOut() {
    this.jwtAuth.signout();
    this.templateService.clear();
  }

  changePwd() {
    this.utilService.modalChangePwd();
  }

  changePicture() {
    this.utilService.modalChangePicture();
  }

  getFullTemplates() {
    this.templateService.setTemplates([]);
    this.apiService.listarDocumentosFull().subscribe({
      next: (value) => {
        this.templateService.setTemplates(value);
      }
    });
  }
}
