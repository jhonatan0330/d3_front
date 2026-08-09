import { ErrorHandler, Injectable, Injector, ApplicationRef, ChangeDetectorRef, inject } from '@angular/core';

@Injectable()
export class ErrorHandlerService extends ErrorHandler {
    protected injector = inject(Injector);


    errorCount = 0;
    // https://github.com/angular/angular/issues/17010
    handleError(error: any) {
        const increment = 5;
        const max = 50;

        // Prevents change detection
        const debugCtx = error['ngDebugContext'];
        const changeDetectorRef = debugCtx && debugCtx.injector.get(ChangeDetectorRef);
        if (changeDetectorRef) {changeDetectorRef.detach();
        }

        this.errorCount = this.errorCount + 1;
        if (this.errorCount % increment === 0) {
            super.handleError(error);

            if (this.errorCount === max) {
                const appRef = this.injector.get(ApplicationRef);
                appRef.tick();
            }
        } else if (this.errorCount === 1) {
            super.handleError(error);
        }
    }
}
