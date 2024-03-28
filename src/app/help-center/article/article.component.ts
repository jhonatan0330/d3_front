import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { HelpCenterService } from '../help-center.service';
import { Article } from '../help-center.type';
import { CommonModule } from '@angular/common';
import { PedidoVentaDTO, PedidoVentaFilterDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { ApiService } from 'app/modules/full/neuron/service/api.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';

@Component({
    selector: 'help-center-guides-guide',
    templateUrl: './article.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [MatButtonModule, RouterLink, MatIconModule, CommonModule],
})
export class ArticleHelpComponent implements OnInit {
    article = new Article();
    document: PedidoVentaDTO;
    questions: PedidoVentaDTO[];

    loadingQuestion: boolean;

    constructor(
        private _helpCenterService: HelpCenterService,
        private route: ActivatedRoute,
        private api: ApiService,
        private utilsService: UtilsService,
        private router: Router) {
    }

    ngOnInit(): void {
        this.route.params.subscribe((params: Params) => {
            if (!params.type || !params.id) {
                this.router.navigate(['/main']);
            } else {
                this._helpCenterService.getArticleByType(params.type, params.id).subscribe({
                    next: (_value: Article) => {
                        this.article = _value;
                    },
                    error: () => {
                        this.router.navigate(['/main']);
                    }
                });
            }
        });
    }

    // Consulta en el servidor el documento
    open() {
        const entity: PedidoVentaFilterDTO = new PedidoVentaFilterDTO();
        entity.llaveTabla = this.article.document;
        this.api.consultarDocumento(entity, null).subscribe({
            next: (_value: PedidoVentaDTO) => {
                this.document = _value;
                const pedidoVenta: PedidoVentaDTO = new PedidoVentaDTO();
                pedidoVenta.plantilla = _value.plantilla;
                pedidoVenta.llaveTabla = _value.llaveTabla;
                this.utilsService.modalWithParams(pedidoVenta);
            },
            error: () => {
                // Mensjae de erro
            }
        });
    }

    getQuestions() {
        this.loadingQuestion = true;
        this._helpCenterService.getQuestionByArticle(this.article.key).subscribe({
            next: (_value: PedidoVentaDTO[]) => {
                this.questions = _value;
                this.loadingQuestion = false;
            }
            , error: () => { this.loadingQuestion = false; }
        });
    }

    newQuestion() {

    }

}