import {
    CreateDocumentAction,
    DocumentActionField,
    DocumentActionFieldType,
    ParsedAssistantResponse,
} from './assistant.models';

const FIELD_TYPES: DocumentActionFieldType[] = ['text', 'number', 'date', 'option'];

export function parseAssistantResponse(content: string): ParsedAssistantResponse {
    const candidate = extractJsonCandidate(content);
    if (!candidate) {
        return { text: content.trim() };
    }

    try {
        const parsed: unknown = JSON.parse(candidate.json);
        if (!isCreateDocumentAction(parsed)) {
            return { text: content.trim() };
        }

        const text = `${content.slice(0, candidate.start)}${content.slice(candidate.end)}`
            .replace(/```json\s*|```/gi, '')
            .trim();

        return {
            text,
            action: parsed,
            json: JSON.stringify(parsed, null, 2),
        };
    } catch {
        return { text: content.trim() };
    }
}

function extractJsonCandidate(content: string): { json: string; start: number; end: number } | undefined {
    const fencedMatch = /```(?:json)?\s*([\s\S]*?)\s*```/i.exec(content);
    if (fencedMatch?.index !== undefined) {
        const json = fencedMatch[1].trim();
        const start = fencedMatch.index;
        return { json, start, end: start + fencedMatch[0].length };
    }

    const start = content.indexOf('{');
    if (start < 0) {
        return undefined;
    }

    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = start; index < content.length; index++) {
        const character = content[index];
        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (character === '\\') {
                escaped = true;
            } else if (character === '"') {
                inString = false;
            }
            continue;
        }
        if (character === '"') {
            inString = true;
        } else if (character === '{') {
            depth++;
        } else if (character === '}') {
            depth--;
            if (depth === 0) {
                return { json: content.slice(start, index + 1), start, end: index + 1 };
            }
        }
    }
    return undefined;
}

function isCreateDocumentAction(value: unknown): value is CreateDocumentAction {
    if (!isRecord(value)
        || value.accion !== 'crear-documento'
        || typeof value.plantilla !== 'string'
        || !value.plantilla.trim()
        || value.requiereConfirmacion !== true
        || !Array.isArray(value.campos)) {
        return false;
    }
    return value.campos.every(isDocumentActionField);
}

function isDocumentActionField(value: unknown): value is DocumentActionField {
    return isRecord(value)
        && typeof value.codigo === 'string'
        && !!value.codigo.trim()
        && typeof value.tipo === 'string'
        && FIELD_TYPES.includes(value.tipo as DocumentActionFieldType)
        && ((value.tipo === 'number' && typeof value.valor === 'number' && Number.isFinite(value.valor))
            || (value.tipo !== 'number' && typeof value.valor === 'string' && !!value.valor.trim()));
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}