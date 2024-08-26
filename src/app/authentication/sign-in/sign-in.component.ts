import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'environments/environment';
import { MatButton } from '@angular/material/button';
import { LoginService } from '../login.service';
import { DomSanitizer } from '@angular/platform-browser';
import { PlantillaHelper } from 'app/shared/plantilla-helper';

@Component({
  selector: 'auth-sign-in',
  templateUrl: './sign-in.component.html',
  encapsulation: ViewEncapsulation.None
})
export class AuthSignInComponent implements OnInit, AfterViewInit {
  @ViewChild(MatButton) submitButton: MatButton;
  currentApplicationVersion = environment.appVersion;
  signInForm: UntypedFormGroup;
  image: string;
  errorMsg = '';
  company = 'Software para ti.com';

  landing =  this.domSanitizer.bypassSecurityTrustHtml(`<div class="min-h-full flex items-center w-full bg-slate-900"></div>`);
  isloginView = true;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _formBuilder: UntypedFormBuilder,
    private jwtAuth: LoginService,
    private _router: Router,
    private domSanitizer:DomSanitizer
  ) {
  }



  ngOnInit(): void {
    // Create the form
    this.signInForm = this._formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

  ngAfterViewInit(): void {
    // this.autoSignIn();
    this.getUrlServices();
  }

  toogleShowLogin(){
    this.isloginView = !this.isloginView;
  }

  signIn(): void {
    // Return if the form is invalid
    if (this.signInForm.invalid) {
      return;
    }
    // Disable the form
    this.signInForm.disable();
    this.submitButton.disabled = true;
    // Sign in
    this.jwtAuth.signin(this.signInForm.value.username, this.signInForm.value.password)
      .subscribe({
        next: () => {
          const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/main';
          // Navigate to the redirect url
          this._router.navigateByUrl(redirectURL);
        },
        error: (response) => {
          // Re-enable the form
          this.signInForm.enable();
          this.submitButton.disabled = false;
          this.errorMsg = response;
          if (this.errorMsg.startsWith('Por seguridad')) {
            this._router.navigateByUrl('sessions/recover');
          }
        }
      }
      );
  }

  getUrlServices() {
    this.jwtAuth.getURL().subscribe({
      next: (data) => {
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
      error: (err) => {
        this.errorMsg = err.message;
        this.jwtAuth.setConfUrl(location.origin);
        this.getOrganization();
      }
    });
  }

  getOrganization() {
    this.jwtAuth.obtenerPrincipalOrganizacion().subscribe({
      next: (organization) => {
        this.signInForm.enable();
        this.company = organization.nombre;
        (organization.imagen) ? (this.image = organization.imagen) : (this.image = 'assets/images/egret.png');
        this.jwtAuth.setCompany(organization);
        if (PlantillaHelper.buscarPropiedad(organization.propiedades, PlantillaHelper.LANDING_PAGE)) {
          this.landing = this.domSanitizer.bypassSecurityTrustHtml(PlantillaHelper.buscarValor(organization.propiedades, PlantillaHelper.LANDING_PAGE));
          this.toogleShowLogin();
        }
      },
      error: (err) => {
        this.signInForm.enable();
        this.errorMsg = err.message;
      }
    });
  }

}
