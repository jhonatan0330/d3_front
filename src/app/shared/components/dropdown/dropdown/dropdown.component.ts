import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, TemplateRef, ViewContainerRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-dropdown',
    exportAs: 'appDropdown',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './dropdown.component.html'
})
export class DropdownComponent {
    private readonly overlay = inject(Overlay);
    private readonly viewContainerRef = inject(ViewContainerRef);
    private readonly destroyRef = inject(DestroyRef);
    private readonly trigger = viewChild<ElementRef<HTMLElement>>('trigger');
    private readonly menuTemplate = viewChild<TemplateRef<unknown>>('menuTemplate');
    private overlayRef?: OverlayRef;

    isOpen = signal(false);

    toggle(event: Event): void {
        event.stopPropagation();
        if (this.isOpen()) {
            this.close();
        } else {
            this.open();
        }
    }

    close(): void {
        this.isOpen.set(false);
        if (this.overlayRef?.hasAttached()) {
            this.overlayRef.detach();
        }
    }

    open(): void {
        const trigger = this.trigger();
        const menuTemplate = this.menuTemplate();

        if (!trigger || !menuTemplate || this.overlayRef?.hasAttached()) {
            return;
        }

        if (!this.overlayRef) {
            this.overlayRef = this.overlay.create({
                hasBackdrop: true,
                backdropClass: 'dropdown-backdrop',
                panelClass: 'dropdown-overlay-pane',
                scrollStrategy: this.overlay.scrollStrategies.reposition(),
                positionStrategy: this.overlay.position()
                    .flexibleConnectedTo(trigger.nativeElement)
                    .withPush(true)
                    .withPositions([
                        {
                            originX: 'end',
                            originY: 'bottom',
                            overlayX: 'end',
                            overlayY: 'top'
                        },
                        {
                            originX: 'end',
                            originY: 'top',
                            overlayX: 'end',
                            overlayY: 'bottom'
                        }
                    ])
            });

            this.overlayRef.backdropClick()
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(() => this.close());
        }

        this.overlayRef.attach(new TemplatePortal(menuTemplate, this.viewContainerRef));
        this.isOpen.set(true);
    }
}
