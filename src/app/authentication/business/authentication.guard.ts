import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { LoginService } from '../login.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard  {
    private _authService = inject(LoginService);
    private _router = inject(Router);

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        const redirectUrl = state.url === '/sign-out' ? '/' : state.url;
        return this._check(redirectUrl);
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const redirectUrl = state.url === '/sign-out' ? '/' : state.url;
        return this._check(redirectUrl);
    }

    private _check(redirectURL: string): Observable<boolean> {
        // Check the authentication status
        return this._authService.checkTokenIsValid()
            .pipe(
                switchMap((authenticated) => {
                    // If the user is not authenticated...
                    if (!authenticated) {
                        if(!redirectURL || redirectURL.endsWith('/main')){
                            this._router.navigate(['sign-in']);
                        }else{
                            this._router.navigate(['sign-in'], { queryParams: { redirectURL } });
                        }
                        // Prevent the access
                        return of(false);
                    }
                    // Allow the access
                    return of(true);
                })
            );
    }
}
