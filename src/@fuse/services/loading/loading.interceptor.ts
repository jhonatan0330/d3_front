import { inject } from '@angular/core';
import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { FuseLoadingService } from '@fuse/services/loading/loading.service';

let initialized = false;
let handleRequestsAutomatically = true;

export const fuseLoadingInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> =>
{
    const fuseLoadingService = inject(FuseLoadingService);

    if ( !initialized )
    {
        initialized = true;

        // Subscribe to the auto mode
        fuseLoadingService.auto$
            .subscribe((value) => {
                handleRequestsAutomatically = value;
            });
    }

    // If the Auto mode is turned off, do nothing
    if ( !handleRequestsAutomatically )
    {
        return next(req);
    }

    // Set the loading status to true
    fuseLoadingService._setLoadingStatus(true, req.url);

    return next(req).pipe(
        finalize(() => {
            // Set the status to false if there are any errors or the request is completed
            fuseLoadingService._setLoadingStatus(false, req.url);
        }));
};
