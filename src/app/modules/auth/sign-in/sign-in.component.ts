import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { ApiService } from 'app/service/api.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Component({
    selector     : 'auth-sign-in',
    templateUrl  : './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class AuthSignInComponent implements OnInit, AfterViewInit
{
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;

    image: string;
    company = 'Software para ti.com';

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private apiService: ApiService,
        private jwtAuth: JwtAuthService,
        private _router: Router
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Create the form
        this.signInForm = this._formBuilder.group({
            email     : ['', [Validators.required]],
            password  : ['', Validators.required],
            rememberMe: [false]
        });
    }

    /**
     * After Init
     */
    ngAfterViewInit() : void
    {
        // this.autoSignIn();
       this.getUrlServices();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void
    {
        // Return if the form is invalid
        if ( this.signInForm.invalid )
        {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        this._authService.signIn(this.signInForm.value)
            .subscribe(
                () => {

                    // Set the redirect url.
                    // The '/signed-in-redirect' is a dummy url to catch the request and redirect the user
                    // to the correct page after a successful sign in. This way, that url can be set via
                    // routing file and we don't have to touch here.
                    const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';

                    // Navigate to the redirect url
                    this._router.navigateByUrl(redirectURL);

                },
                (response) => {

                    // Re-enable the form
                    this.signInForm.enable();

                    // Reset the form
                    this.signInNgForm.resetForm();

                    // Set the alert
                    this.alert = {
                        type   : 'error',
                        message: 'Wrong email or password'
                    };

                    // Show the alert
                    this.showAlert = true;
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
            // Show the alert
            this.alert = {
                type   : 'error',
                message:  err.message
            };
            this.showAlert = true;

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
                // Show the alert
                this.alert = {
                    type   : 'error',
                    message:  err.message
                };
                this.showAlert = true;
            }
          );
      }
}
