import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { JwtAuthService } from 'app/authentication/jwt-auth.service';
import { environment } from 'environments/environment';
import { AuthenticationService } from '../authentication.service';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatButton } from '@angular/material/button';

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
    private _authService: AuthenticationService,
    private _formBuilder: UntypedFormBuilder,
    private apiService: ApiService,
    private jwtAuth: JwtAuthService,
    private _router: Router
  ) {
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Create the form
    this.signInForm = this._formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  /**
   * After Init
   */
  ngAfterViewInit(): void {
    // this.autoSignIn();
    this.getUrlServices();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Sign in
   */
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
    this._authService.signIn(this.signInForm.value)
      .subscribe(
        () => {

          const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/main';

          // Navigate to the redirect url
          this._router.navigateByUrl(redirectURL);

        },
        (response) => {

          // Re-enable the form
          this.signInForm.enable();

          this.submitButton.disabled = false;
          this.progressBar.mode = 'determinate';
          this.errorMsg = response;
          if (this.errorMsg.startsWith('Por seguridad')) {
            this._router.navigateByUrl('sessions/recover');
          }
        }
      );
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
    //this.submitButton.disabled = true;
    //this.progressBar.mode = 'indeterminate';
    this.apiService
      .obtenerPrincipalOrganizacion()
      .subscribe(
        (organization) => {
          //this.submitButton.disabled = false;
          this.signInForm.enable();
          this.company = organization.nombre;
          organization.imagen
            ? (this.image = organization.imagen)
            : (this.image = 'assets/images/egret.png');
          this.jwtAuth.setCompany(organization);
        },
        (err) => {
          this.signInForm.enable();
          this.errorMsg = err.message;
        }
      );
  }
}
