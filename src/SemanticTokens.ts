import * as vscode from 'vscode';

// Generated from standard token types https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide
export enum TokenType {
    Namespace = 'namespace', // For identifiers that declare or reference a namespace, module, or package.
    Class = 'class', // For identifiers that declare or reference a class type.
    Enum = 'enum', // For identifiers that declare or reference an enumeration type.
    Interface = 'interface', // For identifiers that declare or reference an interface type.
    Struct = 'struct', // For identifiers that declare or reference a struct type.
    TypeParameter = 'typeParameter', // For identifiers that declare or reference a type parameter.
    Type = 'type', // For identifiers that declare or reference a type that is not covered above.
    Parameter = 'parameter', // For identifiers that declare or reference a function or method parameter.
    Variable = 'variable', // For identifiers that declare or reference a local or global variable.
    Property = 'property', // For identifiers that declare or reference a member property, member field, or member variable.
    EnumMember = 'enumMember', // For identifiers that declare or reference an enumeration property, constant, or member.
    Decorator = 'decorator', // For identifiers that declare or reference decorators and annotations.
    Event = 'event', // For identifiers that declare an event property.
    Function = 'function', // For identifiers that declare a function.
    Method = 'method', // For identifiers that declare a member function or method.
    Macro = 'macro', // For identifiers that declare a macro.
    Label = 'label', // For identifiers that declare a label.
    Comment = 'comment', // For tokens that represent a comment.
    String = 'string', // For tokens that represent a string literal.
    Keyword = 'keyword', // For tokens that represent a language keyword.
    Number = 'number', // For tokens that represent a number literal.
    Regexp = 'regexp', // For tokens that represent a regular expression literal.
    Operator = 'operator' // For tokens that represent an operator.
}

export enum TokenModifier {
    Declaration = 'declaration', // For declarations of symbols.
    Definition = 'definition', // For definitions of symbols, for example, in header files.
    Readonly = 'readonly', // For readonly variables and member fields (constants).
    Static = 'static', // For class members (static members).
    Deprecated = 'deprecated', // For symbols that should no longer be used.
    Abstract = 'abstract', // For types and member functions that are abstract.
    Async = 'async', // For functions that are marked async.
    Modification = 'modification', // For variable references where the variable is assigned to.
    Documentation = 'documentation', // For occurrences of symbols in documentation.
    DefaultLibrary = 'defaultLibrary' // For symbols that are part of the standard library.
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