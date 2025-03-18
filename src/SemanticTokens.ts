import * as vscode from 'vscode';

// Define enums for token types and modifiers
export enum TokenType {
    Comment = 'comment',
    String = 'string',
    Keyword = 'keyword',
    Number = 'number',
    Regexp = 'regexp',
    Operator = 'operator',
    Namespace = 'namespace',
    Type = 'type',
    Struct = 'struct',
    Class = 'class',
    Interface = 'interface',
    Enum = 'enum',
    TypeParameter = 'typeParameter',
    Function = 'function',
    Method = 'method',
    Decorator = 'decorator',
    Macro = 'macro',
    Variable = 'variable',
    Parameter = 'parameter',
    Property = 'property',
    Label = 'label'
}

export enum TokenModifier {
    Declaration = 'declaration',
    Documentation = 'documentation',
    Readonly = 'readonly',
    Static = 'static',
    Abstract = 'abstract',
    Deprecated = 'deprecated',
    Modification = 'modification',
    Async = 'async'
}

// Convert enums to arrays for use in SemanticTokensLegend
const tokenTypesLegend = Object.values(TokenType);
const tokenModifiersLegend = Object.values(TokenModifier);

// Populate the tokenTypes and tokenModifiers maps
const tokenTypes = new Map<string, number>();
const tokenModifiers = new Map<string, number>();

tokenTypesLegend.forEach((tokenType, index) => tokenTypes.set(tokenType, index));
tokenModifiersLegend.forEach((tokenModifier, index) => tokenModifiers.set(tokenModifier, index));

// Export the SemanticTokensLegend
export const legend = new vscode.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);

// Utility functions for encoding token types and modifiers
export function encodeTokenType(tokenType: TokenType): number {
    if (tokenTypes.has(tokenType)) {
        return tokenTypes.get(tokenType)!;
    }

    throw new Error(`Unknown token type: ${tokenType}`);
}

export function encodeTokenModifiers(modifiers: TokenModifier | TokenModifier[]): number {
    if (!Array.isArray(modifiers)) {
        if (tokenModifiers.has(modifiers)) {
            return (1 << tokenModifiers.get(modifiers)!);
        } else {
            throw new Error(`Unknown token modifier: ${modifiers}`);
        }
    }

    let result = 0;
    for (const tokenModifier of modifiers) {
        if (tokenModifiers.has(tokenModifier)) {
            result = result | (1 << tokenModifiers.get(tokenModifier)!);
        } else {
            throw new Error(`Unknown token modifier: ${tokenModifier}`);
        }
    }
    return result;
}