
import * as vscode from 'vscode';
import { encodeTokenModifiers, encodeTokenType, TokenModifier, TokenType } from "./SemanticTokens";

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
        this.outputChannel.appendLine(`Providing definition for ${document.uri.toString()}`);
        const range = document.getWordRangeAtPosition(position, /<ECSchema[^>]*>/);
        if (range) {
            return new vscode.Location(document.uri, range);
        }
        return undefined;
    }

    public async provideHover(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Hover | undefined> {
        this.outputChannel.appendLine(`Providing hover for ${document.uri.toString()}`);
        const range = document.getWordRangeAtPosition(position, /<ECSchema[^>]*>/);
        if (range) {
            const word = document.getText(range);
            return new vscode.Hover(`Hovering over: ${word}`);
        }
        return undefined;
    }

    public async provideDocumentSemanticTokens(document: vscode.TextDocument, _token: vscode.CancellationToken): Promise<vscode.SemanticTokens> {
        this.outputChannel.appendLine(`Providing semantic tokens for ${document.uri.toString()}`);
        const builder = new vscode.SemanticTokensBuilder();
        builder.push(1, 2, 3, encodeTokenType(TokenType.Class), encodeTokenModifiers(TokenModifier.Declaration));
        return builder.build();
    }

    public async provideCodeActions(document: vscode.TextDocument, _range: vscode.Range): Promise<vscode.CodeAction[] | undefined> {
        this.outputChannel.appendLine(`Providing code actions for ${document.uri.toString()}`);
        const diagnostics = vscode.languages.getDiagnostics(document.uri);
        const duplicateAttributes = diagnostics.filter(diagnostic => diagnostic.message.includes('Duplicate attribute'));

        return duplicateAttributes.map(diagnostic => this.createRemoveDuplicateFix(document, diagnostic.range));
    }

    public async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[] | undefined> {
        this.outputChannel.appendLine(`Providing completions for ${document.uri.toString()}`);
        const lineText = document.lineAt(position).text;
        if (!lineText.includes('<ECSchema')) {
            return undefined;
        }

        const missingAttributes = REQUIRED_ATTRIBUTES.filter(attr => !lineText.includes(attr));
        return missingAttributes.map(attr => new vscode.CompletionItem(attr, vscode.CompletionItemKind.Property));
    }

    public async provideDiagnosticsAfterChange(changes: vscode.TextDocumentChangeEvent, ecschemaDiagnostics: vscode.DiagnosticCollection): Promise<void> {
        this.outputChannel.appendLine(`Generating diagnostics for ${changes.document.uri.toString()}, isChangeEvent: ${changes.contentChanges.length > 0}`);
    }

    public async provideFullDiagnostics(editor: vscode.TextEditor, ecschemaDiagnostics: vscode.DiagnosticCollection): Promise<void> {
        const diagnostics: vscode.Diagnostic[] = [];
        const doc = editor.document;
        const text = doc.getText();
        this.outputChannel.appendLine(`Generating diagnostics for ${doc.uri.toString()}`);
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
}