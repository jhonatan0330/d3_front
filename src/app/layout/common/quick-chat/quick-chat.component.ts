import { Component, ElementRef, HostBinding, HostListener, NgZone, OnDestroy, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { Subject, takeUntil } from 'rxjs';
import { Chat } from 'app/layout/common/quick-chat/quick-chat.types';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { DocumentoPlantillaDTO, PedidoVentaDTO, PedidoVentaFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { FormControl } from '@angular/forms';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { QuickChatService } from './quick-chat.service';

@Component({
    selector: 'quick-chat',
    templateUrl: './quick-chat.component.html',
    styleUrls: ['./quick-chat.component.scss'],
    encapsulation: ViewEncapsulation.None,
    exportAs: 'quickChat'
})
export class QuickChatComponent implements OnInit, OnDestroy {
    chat: Chat;
    chats: Chat[] = [];
    opened: boolean = false;
    isLoading = false;
    hasCreatePermission = false;

    private _scrollStrategy: ScrollStrategy = this._scrollStrategyOptions.block();
    private _overlay: HTMLElement;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    fControlSearch: FormControl = new FormControl(); // Texto que digita el usuario para filtrar

    modules: DocumentoPlantillaDTO[] = [];

    constructor(
        private _elementRef: ElementRef,
        private _renderer2: Renderer2,
        private templateService: TemplateService,
        private api: ApiService,
        private utilsService: UtilsService,
        private _quickChatService: QuickChatService,
        private _scrollStrategyOptions: ScrollStrategyOptions
    ) {
    }

    /**
     * Host binding for component classes
     */
    @HostBinding('class') get classList(): any {
        return {
            'quick-chat-opened': this.opened
        };
    }



    ngOnInit(): void {
        // Chat
        this._quickChatService.chat$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((chat: Chat) => {
                this.chat = chat;
                this.hasCreatePermission = false;
                if (!this.chat || !this.chat.contact) { return; }
                this.hasCreatePermission = !PlantillaHelper.isEmpty(
                    this.chat.contact.propiedades,
                    PlantillaHelper.PERMISO_PLANTILLA_CREAR
                );
            });

        // Chats
        this._quickChatService.chats$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((chats: Chat[]) => {
                this.chats = chats;
            });

        this.templateService.templates$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe({
                next: (templates) => {
                    this.modules = [];
                    if (templates && templates.length !== 0) {
                        // Transform document to MenuItems
                        templates.forEach((element) => {
                            if (PlantillaHelper.buscarPropiedad(element.propiedades, PlantillaHelper.CONTACT_CHAT)) {
                                this.modules.push(element);
                            }
                        });
                    }
                    if (this.modules.length > 0 && this.opened) {
                        this.selectChat(this.modules[0].llaveTabla);
                    }
                }
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Open the panel
     */
    open(): void {
        // Return if the panel has already opened
        if (this.opened) {
            return;
        }

        // Open the panel
        this._toggleOpened(true);
    }

    /**
     * Close the panel
     */
    close(): void {
        // Return if the panel has already closed
        if (!this.opened) {
            return;
        }

        // Close the panel
        this._toggleOpened(false);
    }

    /**
     * Toggle the panel
     */
    toggle(): void {
        if (this.opened) {
            this.close();
        }
        else {
            this.open();
        }
    }

    selectChat(_id: string): void {
        // Open the panel
        this._toggleOpened(true);
        if (!this.chats) this.chats = [];
        const currentChat = this.chats.find((chat) => { return chat.id === _id; });
        if (currentChat) {
            this._quickChatService.setChat(currentChat);
        } else {
            this._quickChatService.setChat({
                id: _id,
                contact: this.modules.find((module) => { return module.llaveTabla === _id; }),
            });
            this.chats.push(this.chat);
            this._quickChatService.setChats(this.chats);
        }

    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Show the backdrop
     *
     * @private
     */
    private _showOverlay(): void {
        // Try hiding the overlay in case there is one already opened
        this._hideOverlay();

        // Create the backdrop element
        this._overlay = this._renderer2.createElement('div');

        // Return if overlay couldn't be create for some reason
        if (!this._overlay) {
            return;
        }

        // Add a class to the backdrop element
        this._overlay.classList.add('quick-chat-overlay');

        // Append the backdrop to the parent of the panel
        this._renderer2.appendChild(this._elementRef.nativeElement.parentElement, this._overlay);

        // Enable block scroll strategy
        this._scrollStrategy.enable();

        // Add an event listener to the overlay
        this._overlay.addEventListener('click', () => {
            this.close();
        });
    }

    /**
     * Hide the backdrop
     *
     * @private
     */
    private _hideOverlay(): void {
        if (!this._overlay) {
            return;
        }

        // If the backdrop still exists...
        if (this._overlay) {
            // Remove the backdrop
            this._overlay.parentNode.removeChild(this._overlay);
            this._overlay = null;
        }

        // Disable block scroll strategy
        this._scrollStrategy.disable();
    }

    /**
     * Open/close the panel
     *
     * @param open
     * @private
     */
    private _toggleOpened(open: boolean): void {
        // Set the opened
        this.opened = open;

        // If the panel opens, show the overlay
        if (open) {
            this._showOverlay();
        }
        // Otherwise, hide the overlay
        else {
            this._hideOverlay();
        }
    }

    sendMesssage(): void {
        if (!this.chat || !this.fControlSearch.value) { return; }
        if (!this.chat.messages) {
            this.chat.messages = [];
        }
        this.chat.messages.push({
            chatId: this.chat.id,
            isMine: false,
            value: this.fControlSearch.value,
            createdAt: new Date().toISOString()
        });
        const entity: PedidoVentaFilterDTO = new PedidoVentaFilterDTO();
        entity.plantilla = this.chat.contact.llaveTabla;
        entity.filtroParametro = this.fControlSearch.value;
        entity.estado = 'A';
        this.isLoading = true;
        this.api.listarDocumentos(entity, null).subscribe({
            next: (dataResult: PedidoVentaDTO[]) => {
                if (!dataResult) { dataResult = []; }
                if (dataResult.length === 0) {
                    this.chat.messages.push({
                        chatId: this.chat.id,
                        isMine: true,
                        value: 'Sin resultados',
                        createdAt: new Date().toISOString()
                    });
                }
                dataResult.forEach((element) => {
                    this.chat.messages.push({
                        id: element.llaveTabla,
                        chatId: this.chat.id,
                        contactId: this.chat.contact.llaveTabla,
                        isMine: true,
                        value: element.descripcion,
                        createdAt: new Date().toISOString()
                    });
                });
                this._quickChatService.setChat(this.chat);
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            },
        });
        this._quickChatService.setChat(this.chat);
        this.fControlSearch.setValue('');
    }

    openDialog(_id: string, _template: string) {
        if (!_template ) { return; }
        const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
        pedidoVenta.plantilla = _template;
        pedidoVenta.llaveTabla = _id;
        this.utilsService.modalWithParams(pedidoVenta);
    }

    sendCreate() {
        if (!this.chat || !this.chat.contact) { return; }
        this.openDialog(null, this.chat.contact.llaveTabla);
    }

}
