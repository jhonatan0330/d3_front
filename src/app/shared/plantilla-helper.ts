
import { PedidoVentaCaracteristicaDTO, PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PropiedadDTO } from './shared.domain';

export class PlantillaHelper {
  /*******************GENERALES***************/
  static FORM_TERCERO = 'TERCERO';
  static FORM_ENCABEZADO = 'ENCABEZADO';
  static FORM_DESCRIPCION = 'DESCRIPCION';
  static FORM_DESCRIPCION_NIVEL2 = 'DESCRIPCION_NIVEL2';
  static FORM_SUBTOTAL = 'SUBTOTAL';
  static FORM_TOTAL = 'TOTAL';
  static FORM_FUNCION_CALCULA_TOTAL = 'TOTAL_FUNCION';
  static FORM_CONSECUTIVO = 'CONSECUTIVO';
  static FORM_FECHA = 'FECHA';
  static FORM_RESPONSABLE = 'RESPONSABLE';
  static FORM_ORDEN = 'ORDEN';
  static FORM_AYUDA = 'AYUDA';
  static FORM_SOLICITAR_FECHAS = 'SOLICITAR_FECHAS';
  static FORM_ANULAR = 'PLANTILLA_ANULAR';
  static COPY_TEXT = 'COPY_TEXT';
  static PERMISO_PLANTILLA_CREAR = 'PERMISO_PLANTILLA_CREAR';
  static PERMISO_PLANTILLA_MODIFICAR = 'PERMISO_PLANTILLA_MODIFICAR';
  static PERMISO_PLANTILLA_ELIMINAR = 'PERMISO_PLANTILLA_ELIMINAR';
  static PERMISO_PLANTILLA_FILTROS_BASE = 'PERMISO_PLANTILLA_FILTROS_BASE';
  static PERMISO_PLANTILLA_INICIO_RAPIDO = 'PERMISO_PLANTILLA_INICIO_RAPIDO';
  static PERMISO_PLANTILLA_CARGA_MASIVA = 'PERMISO_PLANTILLA_CARGA_MASIVA';
  static PLANTILLA_CARGA_MASIVA_MULTIPLE = 'PLANTILLA_CARGA_MASIVA_MULTIPLE'; // arranco con decoentregas
  static PLANTILLA_TIPO_CONFIGURATION = 'PLANTILLA_TIPO_CONFIGURATION';
  static PERMISO_PLANTILLA_CAMBIAR_ESTADO = 'PERMISO_PLANTILLA_CAMBIAR_ESTADO';
  static PERMISO_PLANTILLA_TRANSFERIR = 'PERMISO_PLANTILLA_TRANSFERIR';
  static PERMISO_PLANTILLA_LISTAR_MENU = 'PERMISO_PLANTILLA_LISTAR_MENU';
  static PLANTILLA_OCULTAR_GUARDAR = 'PLANTILLA_OCULTAR_GUARDAR';
  static PLANTILLA_INSTRUCCION_CREAR = 'PLANTILLA_INSTRUCCION_CREAR';
  static PLANTILLA_HISTORIAL_ACTIVO = 'PLANTILLA_HISTORIAL_ACTIVO';
  static PLANTILLA_INICIA_PROCESO = 'PLANTILLA_INICIA_PROCESO';

  static ROL = 'ROL';
  static FUNCION_VALIDAR = 'FUNCION_VALIDAR';
  static MODIFICABLE = 'MODIFICABLE';
  static COLOR = 'COLOR';

  static PERMISO_CAMPO_BLOQUEAR = 'PERMISO_CAMPO_BLOQUEAR';
  static PERMISO_CAMPO_MODIFICABLE = 'PERMISO_CAMPO_MODIFICABLE';
  static PERMISO_CAMPO_OPCIONAL = 'PERMISO_CAMPO_OPCIONAL';
  static PERMISO_CAMPO_RENDER = 'PERMISO_CAMPO_RENDER';

  static PRODUCTO_CAMPO_VALOR_MINIMO = 'PRODUCTO_CAMPO_VALOR_MINIMO';
  static PRODUCTO_CAMPO_VALOR_UNITARIO = 'PRODUCTO_CAMPO_VALOR_UNITARIO';
  static PRODUCTO_CAMPO_CANTIDAD = 'PRODUCTO_CAMPO_CANTIDAD';
  static PRODUCTO_CAMPO_TOTAL = 'PRODUCTO_CAMPO_TOTAL';
  static BUSQUEDA_SIN_TEXTO = 'BUSQUEDA_SIN_TEXTO';

  static PLANTILLA_TIPO_PRODUCTO = 'PLANTILLA_TIPO_PRODUCTO';
  static PLANTILLA_TIPO_REPORTE = 'PLANTILLA_TIPO_REPORTE';

  /*******************CAMPOS***************/
  static DEFAULT = 'DEFAULT';
  static TEXTO_LARGO = 'BASICA';
  static TEXTO_FORMULA = 'TEXTO_FORMULA';
  static DEPENDE = 'DEPENDE';
  static PLANTILLA_AUXILIAR = 'PLANTILLA_AUXILIAR';
  static CAMPO_HEREDADO = 'CAMPO_HEREDADO';
  static ALERTAR_CAMPO_PROCESO = 'ALERTAR_CAMPO_PROCESO';
  static MULTIPLE = 'MULTIPLE';
  static INVISIBLE = 'INVISIBLE';
  static VISIBLE_VALOR_DEPENDIENTE = 'VISIBLE_VALOR_DEPENDIENTE';
  static AUTOLOAD = 'AUTOLOAD';
  static READ_QR = 'READ_QR';
  static LINK_EXTERNO = 'LINK_EXTERNO';
  static SAVE_TO_SELECT = 'SAVE_TO_SELECT';

  static INFORMATIVE_DATA = 'INFORMATIVE_DATA';
  static UPDATE_INFORMATIVE_FIELD = 'UPDATE_INFORMATIVE_FIELD';

  static ARCHIVO_TIPO = 'ARCHIVO_TIPO';
  static ARCHIVO_TAMANO_MAXIMO = 'ARCHIVO_TAMANO_MAXIMO';
  static MULTIPLE_FILE = 'MULTIPLE_FILE';
  static ARCHIVO_URL_USUARIO = 'ARCHIVO_URL_USUARIO';
  static VALIDATE_ORIENTATION = 'VALIDATE_ORIENTATION';
  static ARCHIVO_FIRMA = 'ARCHIVO_FIRMA';

  static PROCESO_FUNCION_SQL = 'PROCESO_FUNCION_SQL';

  static FORCE_NOTIFICATION = 'FORCE_NOTIFICATION';
  static FECHA_CON_HORA = 'FECHA_CON_HORA';
  static FECHA_SIN_CALENDAR = 'FECHA_SIN_CALENDAR';
  static FECHA_RANGO = 'FECHA_RANGO';
  static FECHA_TIMER_BACK = 'FECHA_TIMER_BACK';

  static BINARIO_VERDADERO = 'BINARIO_VERDADERO';
  static BINARIO_FALSO = 'BINARIO_FALSO';
  static BINARIO_PREGUNTA = 'BINARIO_PREGUNTA';

  static NUMERO_MONEDA = 'NUMERO_MONEDA';
  static NUMERO_FORMULA = 'NUMERO_FORMULA';
  static NUMERO_MAXIMO = 'NUMERO_MAXIMO';
  static NUMERO_MINIMO = 'NUMERO_MINIMO';
  static NUMERO_FUNCION = 'NUMERO_FUNCION_SQL';
  static NUMERO_REDONDEO = 'NUMERO_REDONDEO';
  static NUMERO_STEP = 'NUMERO_STEP';
  static UNICO_PRODUCTO = 'UNICO_PRODUCTO';
  static DETALLE_TARIFA_PRODUCTO = 'DETALLE_TARIFA_PRODUCTO';
  static DETALLE_OCULTAR_UNIDADES_NOMBRE_CANTIDAD =
    'DETALLE_OCULTAR_UNIDADES_NOMBRE_CANTIDAD';

  static PROCESO_POP = 'PROCESO_POP';
  static PROCESO_ACCIONES = 'PROCESO_ACCIONES';
  static PROCESO_VALOR = 'PROCESO_VALOR';
  static BODEGA_FIJA = 'BODEGA_FIJA';
  static BODEGA_MOVIMIENTO = 'BODEGA_MOVIMIENTO';

  static MULTIPLE_SELECCION = 'MULTIPLE_SELECCION';
  static REP_VISIBLE_STATE = 'REP_VISIBLE_STATE';
  static REP_AUTOPRINT = 'REP_AUTOPRINT';

  static COVERAGE_IMAGE = 'COVERAGE_IMAGE';
  static COVERAGE_TEMPLATE = 'COVERAGE_TEMPLATE';


  static buscarPropiedad(
    propiedades: PropiedadDTO[],
    key: string
  ): PropiedadDTO {
    if (propiedades) {
      return propiedades.find(function (property: PropiedadDTO) {
        return property.key === key;
      });
    } else {
      return null;
    }
  }

  static buscarValor(propiedades: PropiedadDTO[], key: string): string {
    const p: PropiedadDTO = PlantillaHelper.buscarPropiedad(propiedades, key);
    if (p) {
      return p.valor;
    }
    return '';
  }

  static buscarValorMultipleFromManyKeys(
    propiedades: PropiedadDTO[],
    keys: string[]
  ): PropiedadDTO[] {
    if (propiedades == null || propiedades.length === 0) {
      return null;
    }
    if (keys == null || keys.length === 0) {
      return null;
    }
    const result: PropiedadDTO[] = [];
    keys.forEach((key) =>{
      propiedades.forEach((element) => {
        if (element.key === key) {
          result.push(element);
        }
      });
    });
    if (result.length === 0) { return null; }
    return result;
  }

  static buscarValorMultiple(
    propiedades: PropiedadDTO[],
    key: string
  ): PropiedadDTO[] {
    if (key == null) { return null;}
    return this.buscarValorMultipleFromManyKeys(propiedades,[key]);
  }

  static agregarPropiedad(
    propiedades: PropiedadDTO[],
    key: string,
    value: string
  ): PropiedadDTO[] {
    if (propiedades == null) {
      propiedades = [];
    }
    const newParam: PropiedadDTO = new PropiedadDTO();
    newParam.key = key;
    newParam.valor = value;
    propiedades.push(newParam);
    return propiedades;
  }

  static isEmpty(propiedades: PropiedadDTO[], key: string): boolean {
    if (!this.buscarPropiedad(propiedades, key)) {
      return true;
    } else {
      return false;
    }
  }
}

export class MVCTranslate {
  static calculateText(text: string): string {
    let posOperator = -1;
    let leftOperator = 0;
    let righOperator = 0;

    posOperator = text.indexOf('-',1);
    if (posOperator !== -1) {
      leftOperator = Number(text.substring(0, posOperator));
      righOperator = Number(text.substring(posOperator + 1, text.length));
      text = String(leftOperator - righOperator);
    } else {
      posOperator = text.indexOf('+');
      if (posOperator !== -1) {
        leftOperator = Number(text.substring(0, posOperator));
        righOperator = Number(text.substring(posOperator + 1, text.length));
        text = String(leftOperator + righOperator);
      } else {
        posOperator = text.indexOf('*');
        if (posOperator !== -1) {
          console.log('Operacion * :' + text);
          leftOperator = Number(text.substring(0, posOperator));
          console.log('left :' + leftOperator.toFixed(8));
          righOperator = Number(
            text.substring(posOperator + 1, text.length)
          );
          console.log('rigth :' + righOperator.toString());
          text = (leftOperator * righOperator).toFixed(8);
          console.log('Result :' + text);
        } else {
          posOperator = text.indexOf('/');
          if (posOperator !== -1) {
            leftOperator = Number(text.substring(0, posOperator));
            righOperator = Number(
              text.substring(posOperator + 1, text.length)
            );
            if(righOperator === 0){
              text = "0";
            } else {
              text = (leftOperator / righOperator).toFixed(8); // Posiblemente falle por ceiling
            }
            
          } else {
            posOperator = text.indexOf('%');
            if (posOperator !== -1) {
              leftOperator = Number(text.substring(0, posOperator));
              righOperator = Number(
                text.substring(posOperator + 1, text.length)
              );
              text = (leftOperator % righOperator).toPrecision(10);
            } else {
              posOperator = text.indexOf('<');
              if (posOperator != -1) {
                leftOperator = Number(
                  text.substring(0, posOperator)
                );
                righOperator = Number(
                  text.substring(posOperator + 1, text.length)
                );
                text = (leftOperator < righOperator)?"1":"-1";//new BigDecimal(righOperator.compareTo(leftOperator));
              } else {
                posOperator = text.indexOf('>');
                if (posOperator != -1) {
                  leftOperator = Number(
                    text.substring(0, posOperator)
                  );
                  righOperator = Number(
                    text.substring(posOperator + 1, text.length)
                  );
                  text = (leftOperator > righOperator)?"1":"-1"; //new BigDecimal(leftOperator.compareTo(righOperator));
                } else {
                  text = String(text);
                }
              }
              /*
              posOperator = text.indexOf('?');

              if (posOperator !== -1) {
                const parentesisAbre = text.indexOf('(');
                if (parentesisAbre !== -1) {
                  return text;
                }

                strComparation = text.substring(0, posOperator);
                posComparator = strComparation.indexOf('>');

                if (posComparator !== -1) {
                  leftOperator = Number(
                    strComparation.substring(0, posComparator)
                  );
                  righOperator = Number(
                    strComparation.substring(
                      posComparator + 1,
                      strComparation.length - 2
                    )
                  );
                  text = text.substring(posOperator + 1, text.length - 1);
                  posOperator = text.indexOf(':');
                  if (leftOperator > righOperator) {
                    text = text.substring(0, posOperator);
                  } else {
                    text = text.substring(posOperator + 1, text.length - 1);
                  }
                } else {
                  posComparator = strComparation.indexOf('<');
                  if (posComparator !== -1) {
                    leftOperator = Number(
                      strComparation.substring(0, posComparator)
                    );
                    righOperator = Number(
                      strComparation.substring(
                        posComparator + 1,
                        strComparation.length - 2
                      )
                    );
                    text = text.substring(posOperator + 1, text.length - 1);
                    posOperator = text.indexOf(':');
                    if (leftOperator < righOperator) {
                      text = text.substring(0, posOperator);
                    } else {
                      text = text.substring(posOperator + 1, text.length - 1);
                    }
                  } else {
                    posComparator = strComparation.indexOf('=');
                    if (posComparator !== -1) {
                      leftOperator = Number(
                        strComparation.substring(0, posComparator)
                      );
                      righOperator = Number(
                        strComparation.substring(
                          posComparator + 1,
                          strComparation.length - 2
                        )
                      );
                      text = text.substring(posOperator + 1, text.length - 1);
                      posOperator = text.indexOf(':');
                      if (leftOperator === righOperator) {
                        text = text.substring(0, posOperator);
                      } else {
                        text = text.substring(posOperator + 1, text.length - 1);
                      }
                    } else {
                    }
                  }
                }
              } else {
              }*/
            }
          }
        }
      }
    }
    if (!text) {
      return '0';
    }
    return text;
  }

}
 export class FieldHelper {
  
  static getValueDate(document: PedidoVentaDTO, code:string): Date {
		const field: PedidoVentaCaracteristicaDTO = FieldHelper.getField(document, code);
		if (field==null) return null;
		return field.valorFecha;
	}

	static getValueText(document: PedidoVentaDTO, code:string): string {
		const field: PedidoVentaCaracteristicaDTO = FieldHelper.getField(document, code);
		if (field==null) return null;
		return field.valorText;
	}
	
	static getValueOption(document: PedidoVentaDTO, code:string): string {
		const field: PedidoVentaCaracteristicaDTO = FieldHelper.getField(document, code);
		if (field==null) return null;
		return field.valorOpcion;
	}
	
	static getValueBool(document: PedidoVentaDTO, code:string):boolean {
		const field: PedidoVentaCaracteristicaDTO = FieldHelper.getField(document, code);
		if (field==null) return null;
		if (!field.valorNumero) return false;
		return (field.valorNumero===1);
	}
	
	static getField(document: PedidoVentaDTO, code:String): PedidoVentaCaracteristicaDTO {
		if(document==null)	return null;
		if(!document.caracteristicas || document.caracteristicas.length==0) return null;

    for (let i = 0; i < document.caracteristicas.length; i++) {
      const iField = document.caracteristicas[i];
      if (iField.campoDTO && iField.campoDTO.codigo===code)
      return iField;
    }
		return null;
	}
 }