import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LoginService } from '../../authentication/login.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'environments/environment';
import { OrganizacionDTO } from '../../authentication/authentication.domain';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})

export class LoginComponent implements OnInit, OnDestroy {

  signInForm: UntypedFormGroup;
  isLoading = false;
  company: OrganizacionDTO;
  hasLanding = false;
  currentApplicationVersion = environment.appVersion;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _formBuilder: UntypedFormBuilder,
    public loginservice: LoginService,
    private route: ActivatedRoute,
    private router: Router,
    public dialogRef: MatDialogRef<LoginComponent>,

  ) { }

  ngOnInit() {

    // Subscribe to the company
    this.loginservice.company$
      .pipe((takeUntil(this._unsubscribeAll)))
      .subscribe((company: OrganizacionDTO) => {
        if (!company || !company.llaveTabla) {
          this.company = undefined;
          return;
        }
        this.company = company;
      });

    console.log('company', this.company);

    this.signInForm = this._formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }


  signIn(): void {
    // Return if the form is invalid
    if (this.signInForm.invalid) {
      return;
    }
    // Disable the form
    this.signInForm.disable();
    this.isLoading = true;
    // Sign in
    this.loginservice.signin(this.signInForm.value.username, this.signInForm.value.password, null)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.signInForm.enable();
          this.signInForm.controls['password'].setValue('');
          this.closeLogin();
          const redirectURL = this.route.snapshot.queryParamMap.get('redirectURL') || '/main';
          // Navigate to the redirect url
          this.router.navigateByUrl(redirectURL);
        },
        error: (response) => {
          // Re-enable the form
          this.signInForm.enable();
          this.isLoading = false;
          if (response.startsWith('Por seguridad')) {
            this.router.navigateByUrl('sessions/recover');
          }
        }
      }
      );
  }

  closeLogin() {
    this.dialogRef.close(false);
  }
  
}
