import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { JwtAuthService } from '../../../shared/services/auth/jwt-auth.service';
import { ApiService } from '../../../service/api.service';
import { NavigationService } from 'app/shared/services/navigation.service';
import { environment } from 'environments/environment';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';

@Component({
  selector: 'app-signin',
  providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}],
  templateUrl: './signin.component.html'
})
export class SigninComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;

  currentApplicationVersion = environment.appVersion;
  signinForm: FormGroup;
  errorMsg = '';
  image: string;
  company = 'Software para ti.com';

  private _unsubscribeAll: Subject<any>;

  constructor(
    private navService: NavigationService,
    private jwtAuth: JwtAuthService,
    private apiService: ApiService,
    private router: Router
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    this.signinForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      rememberMe: new FormControl(false),
    });
  }

  ngAfterViewInit() {
    // this.autoSignIn();
    this.getUrlServices();
  }

  ngOnDestroy() {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  signin() {
    const signinData = this.signinForm.value;

    this.submitButton.disabled = true;
    this.progressBar.mode = 'indeterminate';

    this.jwtAuth.signin(signinData.username, signinData.password).subscribe({
      next: (response) => {
        if (response && response.modulos && response.modulos.length !== 0) {
          if (response.modulos.find((modulo) => modulo.moduloLlave === 'AdministracionLogisticpymes')) {
            this.jwtAuth.isAdmin = true;
          } else {
            this.jwtAuth.isAdmin = false;
          }
          if (
            response.modulos.find(
              (modulo) => modulo.moduloLlave === 'UIVotacion'
            )
          ) {
            this.router.navigateByUrl('/UIVotacion');
            if (response.modulos.length === 1) {
              this.navService.iconMenu = [];
            } else {
              this.navService.iconMenu = [{
                name: 'DASHBOARD',
                type: 'link',
                tooltip: 'Dashboard',
                icon: 'dashboard',
                state: ''
              }];
            }
            this.navService.publishNavigationChange(null);
            return;
          } else {
              this.navService.iconMenu = [{
                name: 'DASHBOARD',
                type: 'link',
                tooltip: 'Dashboard',
                icon: 'dashboard',
                state: ''
              }];
              this.navService.publishNavigationChange(null);
          }
        }
        this.router.navigateByUrl(this.jwtAuth.return);
      },
      error: (err) => {
        this.submitButton.disabled = false;
        this.progressBar.mode = 'determinate';
        this.errorMsg = err;
        if(this.errorMsg.startsWith('Por seguridad')) {
          this.router.navigateByUrl('sessions/recover');
        }
      }
    });
  }

  getUrlServices() {
    // this.submitButton.disabled = true;
    // this.progressBar.mode = 'indeterminate';
    this.apiService.getURL().subscribe(
      (data) => {
        if (data !== '' && data !== 'SW42') {
          if (!data.endsWith('/')) {
            data = data + '/';
          }
          this.jwtAuth.setConfUrl(data.toString());
          this.getOrganization();
        } else {
          this.jwtAuth.setConfUrl(location.origin);
          this.getOrganization();
        }
      },
      (err) => {
        this.errorMsg = err.message;
        this.jwtAuth.setConfUrl(location.origin);
        this.getOrganization();
      }
    );
  }

  getOrganization() {
    this.submitButton.disabled = true;
    this.progressBar.mode = 'indeterminate';
    this.apiService
      .obtenerPrincipalOrganizacion()
      .subscribe(
        (organization) => {
          this.submitButton.disabled = false;
          this.progressBar.mode = 'determinate';
          this.company = organization.nombre;
          organization.imagen
            ? (this.image = organization.imagen)
            : (this.image = 'assets/images/egret.png');
          this.jwtAuth.setCompany(organization);
        },
        (err) => {
          this.submitButton.disabled = false;
          this.progressBar.mode = 'determinate';
          this.errorMsg = err.message;
        }
      );
  }
}
