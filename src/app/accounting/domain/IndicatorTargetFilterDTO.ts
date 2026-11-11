import { BasicFilterDTO } from "app/shared/shared.domain";

export class IndicatorTargetFilterDTO {
    key: string;
    startRow: number;
    endRow: number;
    filter: string;
    state: string;
    indicador?: string;
}
