import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'environments/environment';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatButton } from '@angular/material/button';
import { LoginService } from '../login.service';

@Component({
  selector: 'auth-sign-in',
  templateUrl: './sign-in.component.html',
  encapsulation: ViewEncapsulation.None
})
export class AuthSignInComponent implements OnInit, AfterViewInit {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;
  currentApplicationVersion = environment.appVersion;
  signInForm: UntypedFormGroup;
  image: string;
  errorMsg = '';
  company = 'Software para ti.com';

  /**
   * Constructor
   */
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _formBuilder: UntypedFormBuilder,
    private jwtAuth: LoginService,
    private _router: Router
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

  signIn(): void {
    // Return if the form is invalid
    if (this.signInForm.invalid) {
      return;
    }
    // Disable the form
    this.signInForm.disable();
    this.submitButton.disabled = true;
    this.progressBar.mode = 'indeterminate';
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
          this.progressBar.mode = 'determinate';
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
      },
      error: (err) => {
        this.signInForm.enable();
        this.errorMsg = err.message;
      }
    });
  }

}
