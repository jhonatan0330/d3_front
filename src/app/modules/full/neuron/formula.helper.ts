import { MVCTranslate } from '../../../shared/plantilla-helper';

export class FormulaHelper {
  static calcular(formula: string): number {
    formula = formula.replaceAll("+-","-");
    formula = formula.replaceAll("--","+");
    console.log('For.Calc: ' + formula);
    let result: number;

    const parentesisCierra = formula.indexOf(')');
    if (parentesisCierra !== -1) {
      const parentesisAbre = formula
        .substring(0, parentesisCierra)
        .lastIndexOf('(');
      if (parentesisAbre === -1) {
        alert('Formula incorrecta.Parentesis' + formula);
      } else {
        let formulaInterna = formula.substring(
          parentesisAbre + 1,
          parentesisCierra
        );
        const formulaInternaCalculada: string =
          this.calcular(formulaInterna).toString();
        formulaInterna = '(' + formulaInterna + ')';
        formula = formula.split(formulaInterna).join(formulaInternaCalculada);
        console.log('For.Nueva: ' + formula);
        result = this.calcular(formula);
      }
    } else {
      const signo = formula.indexOf('?');
      if (signo !== -1) {
        let dospunto = formula.indexOf(':');
        let carac = formula.substring(signo + 1, dospunto);
        let newPregunta = carac.indexOf('?');
        while (dospunto > 0 && newPregunta !== -1) {
          dospunto = formula.indexOf(':', dospunto + 1);
          carac = formula.substring(signo + newPregunta + 2, dospunto);
          newPregunta = carac.indexOf('?');
        }
        if (dospunto === -1) {
          alert('Formula incorrecta.dos puntos' + formula);
        }
        result = this.calcular(formula.substring(0,signo));
        if(result>0){
          result = this.calcular(formula.substring(signo+1,dospunto));
        } else {
          result = this.calcular(formula.substring(dospunto + 1, formula.length));
        }
      } else {
        result = Number(MVCTranslate.calculateText(formula));
        console.log('For.Calc: ' + formula + ' \t Valor: ' + result.toString());
      }
    }
    if (!result) {
      result = 0;
    }
    return result;
  }
}
