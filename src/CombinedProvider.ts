
import * as vscode from 'vscode';

const tokenTypes = new Map<string, number>();
const tokenModifiers = new Map<string, number>();
export const legend = (function() {
	const tokenTypesLegend = [
		'comment', 'string', 'keyword', 'number', 'regexp', 'operator', 'namespace',
		'type', 'struct', 'class', 'interface', 'enum', 'typeParameter', 'function',
		'method', 'decorator', 'macro', 'variable', 'parameter', 'property', 'label'
	];
	tokenTypesLegend.forEach((tokenType, index) => tokenTypes.set(tokenType, index));

	const tokenModifiersLegend = [
		'declaration', 'documentation', 'readonly', 'static', 'abstract', 'deprecated',
		'modification', 'async'
	];
	tokenModifiersLegend.forEach((tokenModifier, index) => tokenModifiers.set(tokenModifier, index));

	return new vscode.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);
})();

const REQUIRED_ATTRIBUTES = ['schemaName', 'alias', 'version', 'description', 'displayLabel', 'xmlns'];

export class CombinedProvider implements vscode.DefinitionProvider,
                                        vscode.HoverProvider,
                                        vscode.DocumentSemanticTokensProvider,
                                        vscode.CodeActionProvider,
                                        vscode.CompletionItemProvider {

    private outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
    }

    public async provideDefinition(document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken): Promise<vscode.Definition | undefined> {
        const range = document.getWordRangeAtPosition(position, /<ECSchema[^>]*>/);
        if (range) {
            return new vscode.Location(document.uri, range);
        }
        return undefined;
    }

    public async provideHover(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Hover | undefined> {
        const range = document.getWordRangeAtPosition(position, /<ECSchema[^>]*>/);
        if (range) {
            const word = document.getText(range);
            return new vscode.Hover(`Hovering over: ${word}`);
        }
        return undefined;
    }

    public async provideDocumentSemanticTokens(document: vscode.TextDocument, _token: vscode.CancellationToken): Promise<vscode.SemanticTokens> {
        const allTokens = this._parseText(document.getText());
        const builder = new vscode.SemanticTokensBuilder();
        allTokens.forEach((token) => {
            builder.push(token.line, token.startCharacter, token.length, this._encodeTokenType(token.tokenType), this._encodeTokenModifiers(token.tokenModifiers));
        });
        return builder.build();
    }

    public async provideCodeActions(document: vscode.TextDocument, _range: vscode.Range): Promise<vscode.CodeAction[] | undefined> {
        const diagnostics = vscode.languages.getDiagnostics(document.uri);
        const duplicateAttributes = diagnostics.filter(diagnostic => diagnostic.message.includes('Duplicate attribute'));

        return duplicateAttributes.map(diagnostic => this.createRemoveDuplicateFix(document, diagnostic.range));
    }

    public async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[] | undefined> {
        const lineText = document.lineAt(position).text;
        if (!lineText.includes('<ECSchema')) {
            return undefined;
        }

        const missingAttributes = REQUIRED_ATTRIBUTES.filter(attr => !lineText.includes(attr));
        return missingAttributes.map(attr => new vscode.CompletionItem(attr, vscode.CompletionItemKind.Property));
    }

    public async provideDiagnostics(doc: vscode.TextDocument, ecschemaDiagnostics: vscode.DiagnosticCollection): Promise<void> {
        const diagnostics: vscode.Diagnostic[] = [];
        const text = doc.getText();
        const rootElementMatch = text.match(/<ECSchema\s+([^>]+)>/);
    
        if (rootElementMatch) {
            const attributesText = rootElementMatch[1];
            const attributes = attributesText.split(/\s+/).map(attr => attr.split('=')[0]);
    
            REQUIRED_ATTRIBUTES.forEach(attr => {
                if (!attributes.includes(attr)) {
                    const index = text.indexOf('<ECSchema');
                    const range = new vscode.Range(doc.positionAt(index), doc.positionAt(index + rootElementMatch[0].length));
                    diagnostics.push(new vscode.Diagnostic(range, `Missing attribute: ${attr}`, vscode.DiagnosticSeverity.Warning));
                }
            });
    
            const duplicateAttributes = attributes.filter((attr, index) => attributes.indexOf(attr) !== index);
            duplicateAttributes.forEach(attr => {
                const index = attributesText.indexOf(attr);
                const range = new vscode.Range(doc.positionAt(index), doc.positionAt(index + attr.length));
                diagnostics.push(new vscode.Diagnostic(range, `Duplicate attribute: ${attr}`, vscode.DiagnosticSeverity.Error));
            });
        }
    
        ecschemaDiagnostics.set(doc.uri, diagnostics);
    }

    private createRemoveDuplicateFix(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction {
        const fix = new vscode.CodeAction('Remove duplicate attribute', vscode.CodeActionKind.QuickFix);
        fix.edit = new vscode.WorkspaceEdit();
        fix.edit.delete(document.uri, range);
        return fix;
    }

    private _encodeTokenType(tokenType: string): number {
        return tokenTypes.get(tokenType) ?? 0;
    }

    private _encodeTokenModifiers(tokenModifiers: string[]): number {
        let result = 0;
        for (const tokenModifier of tokenModifiers) {
            result |= (1 << (tokenModifiers.indexOf(tokenModifier) ?? 0));
        }
        return result;
    }

    private _parseText(text: string): IParsedToken[] {
        const tokens: IParsedToken[] = [];
        const lines = text.split(/\r\n|\r|\n/);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line.includes('<ECSchema')) {
                tokens.push({
                    line: i,
                    startCharacter: 0,
                    length: line.length,
                    tokenType: 'invalid',
                    tokenModifiers: []
                });
            }
        }
        return tokens;
    }
}


interface IParsedToken {
    line: number;
    startCharacter: number;
    length: number;
    tokenType: string;
    tokenModifiers: string[];
}