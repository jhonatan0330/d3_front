/**
 * Tipos de respuesta API compartidos — ARCH-011 / T-FRONT-080
 *
 * Espejo exacto de contract.md § SharedIdResponse y § SharedApiErrorResponse.
 * Fuente de verdad: contract.md. Cualquier desviación es un defecto.
 */

export interface SharedIdResponse {
  id: string;
  code?: string;
  state?: string;
  comment?: string;
  messages?: string[];
}

export interface SharedApiErrorResponse {
  status: number;
  error_code: string;
  message: string;
  detail?: string;
}
