import * as vscode from 'vscode';

const REQUIRED_ATTRIBUTES = ['schemaName', 'alias', 'version', 'description', 'displayLabel', 'xmlns'];

const tokenTypes = new Map<string, number>();
const tokenModifiers = new Map<string, number>();

const legend = (function() {
    const tokenTypesLegend = ['invalid'];
    tokenTypesLegend.forEach((tokenType, index) => tokenTypes.set(tokenType, index));

    const tokenModifiersLegend = ['duplicate'];
    tokenModifiersLegend.forEach((tokenModifier, index) => tokenModifiers.set(tokenModifier, index));

    return new vscode.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);
})();

export function activate(context: vscode.ExtensionContext) {
    const selector: vscode.DocumentFilter = { language: 'xml', pattern: '**/*.ecschema.xml' };
    context.subscriptions.push(
        vscode.languages.registerDocumentSemanticTokensProvider(selector, new DocumentSemanticTokensProvider(), legend)
    );

    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(selector, new ECSchemaCodeActionsProvider(), {
            providedCodeActionKinds: ECSchemaCodeActionsProvider.providedCodeActionKinds
        })
    );

    const ecschemaDiagnostics = vscode.languages.createDiagnosticCollection("ecschema");
    context.subscriptions.push(ecschemaDiagnostics);

    subscribeToDocumentChanges(context, ecschemaDiagnostics);

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(selector, new ECSchemaCompletionItemProvider(), '<')
    );

    context.subscriptions.push(
        vscode.languages.registerHoverProvider(selector, new ECSchemaHoverProvider()));
}

class ECSchemaHoverProvider implements vscode.HoverProvider {
    provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Hover> {
        const range = document.getWordRangeAtPosition(position, /<ECSchema[^>]*>/);
        if (range) {
            const word = document.getText(range);
            return new vscode.Hover(`Hovering over: ${word}`);
        }
        return undefined;
    }
}

class DocumentSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
    async provideDocumentSemanticTokens(document: vscode.TextDocument, _token: vscode.CancellationToken): Promise<vscode.SemanticTokens> {
        const allTokens = this._parseText(document.getText());
        const builder = new vscode.SemanticTokensBuilder();
        allTokens.forEach((token) => {
            builder.push(token.line, token.startCharacter, token.length, this._encodeTokenType(token.tokenType), this._encodeTokenModifiers(token.tokenModifiers));
        });
        return builder.build();
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

class ECSchemaCodeActionsProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

    public provideCodeActions(document: vscode.TextDocument, _range: vscode.Range): vscode.CodeAction[] | undefined {
        const diagnostics = vscode.languages.getDiagnostics(document.uri);
        const duplicateAttributes = diagnostics.filter(diagnostic => diagnostic.message.includes('Duplicate attribute'));

        return duplicateAttributes.map(diagnostic => this.createRemoveDuplicateFix(document, diagnostic.range));
    }

    private createRemoveDuplicateFix(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction {
        const fix = new vscode.CodeAction('Remove duplicate attribute', vscode.CodeActionKind.QuickFix);
        fix.edit = new vscode.WorkspaceEdit();
        fix.edit.delete(document.uri, range);
        return fix;
    }
}

class ECSchemaCompletionItemProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] {
        const lineText = document.lineAt(position).text;
        if (!lineText.includes('<ECSchema')) {
            return [];
        }

        const missingAttributes = REQUIRED_ATTRIBUTES.filter(attr => !lineText.includes(attr));
        return missingAttributes.map(attr => new vscode.CompletionItem(attr, vscode.CompletionItemKind.Property));
    }
}

function subscribeToDocumentChanges(context: vscode.ExtensionContext, ecschemaDiagnostics: vscode.DiagnosticCollection): void {
    if (vscode.window.activeTextEditor) {
        refreshDiagnostics(vscode.window.activeTextEditor.document, ecschemaDiagnostics);
    }
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                refreshDiagnostics(editor.document, ecschemaDiagnostics);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(e => refreshDiagnostics(e.document, ecschemaDiagnostics))
    );

    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument(doc => ecschemaDiagnostics.delete(doc.uri))
    );
}

function refreshDiagnostics(doc: vscode.TextDocument, ecschemaDiagnostics: vscode.DiagnosticCollection): void {
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

interface IParsedToken {
    line: number;
    startCharacter: number;
    length: number;
    tokenType: string;
    tokenModifiers: string[];
}