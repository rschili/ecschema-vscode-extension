
import * as vscode from 'vscode';
import { encodeTokenModifiers, encodeTokenType, legend, TokenModifier, TokenType } from "./SemanticTokens";
import { DocumentCache, DocumentCacheEntry } from "./Cache";
import { getRangeForNode, isElement, isAttribute } from './Xml';

const REQUIRED_ATTRIBUTES = ['schemaName', 'alias', 'version', 'description', 'displayLabel', 'xmlns'];

export class ECSchemaExtension implements vscode.DefinitionProvider,
                                        vscode.HoverProvider,
                                        vscode.DocumentSemanticTokensProvider,
                                        vscode.CodeActionProvider,
                                        vscode.CompletionItemProvider {

    private outputChannel: vscode.OutputChannel;
    private documentCache: DocumentCache;
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor(outputChannel: vscode.OutputChannel, diagnosticCollection: vscode.DiagnosticCollection) {
        this.outputChannel = outputChannel;
        this.documentCache = new DocumentCache(outputChannel);
        this.diagnosticCollection = diagnosticCollection;
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

    public async provideDocumentSemanticTokens(document: vscode.TextDocument, _token: vscode.CancellationToken): Promise<vscode.SemanticTokens | undefined> {
        this.outputChannel.appendLine(`Providing semantic tokens for ${document.uri.toString()}`);
        let cacheEntry:  DocumentCacheEntry;
        try {
            cacheEntry = await this.documentCache.getOrCreateEntry(document.uri, document);
        } catch (e: any) {
            this.outputChannel.appendLine(`Error getting document cache entry: ${e.message}`);
            const diagnostics: vscode.Diagnostic[] = [];
            const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(document.lineCount - 1, 500));
            diagnostics.push(new vscode.Diagnostic(range, `Error parsing document: ${e.message}`, vscode.DiagnosticSeverity.Error));
            return undefined;
        }
        if(cacheEntry.isDirty) {
            return undefined; // cannot provide anything right now
        }

        const builder = new vscode.SemanticTokensBuilder(legend);
        const rootNode = cacheEntry.xml.firstChild?.nextSibling?.nextSibling;
        if(!rootNode) {
            return undefined;
        }
        const rootName = rootNode?.localName;
        if (rootName !== 'ECSchema') {
            const diagnostics: vscode.Diagnostic[] = [];
            const range = getRangeForNode(rootNode);
            diagnostics.push(new vscode.Diagnostic(range, 'Root node ECSchema expected', vscode.DiagnosticSeverity.Error));
            return undefined;
        }

        let tokens: vscode.SemanticTokens;
        try {
        builder.push(getRangeForNode(rootNode), TokenType.Keyword, [TokenModifier.Declaration]);

        for(const node of rootNode.childNodes) {
            if(isElement(node)) {
                builder.push(getRangeForNode(node), TokenType.Keyword, [TokenModifier.Declaration]);
                for(const subNode of node.childNodes) {
                    if(isElement(subNode)) {
                        builder.push(getRangeForNode(subNode), TokenType.Keyword, [TokenModifier.Declaration]);
                    }
                }
            }
        }
        tokens = builder.build();
        } catch (e: any) {
            this.outputChannel.appendLine(`Error building semantic tokens: ${e.message}`);
            return undefined;
        }

        this.outputChannel.appendLine(`Returning semantic tokens`);
        return tokens;
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

    public async provideDiagnosticsAfterChange(changes: vscode.TextDocumentChangeEvent): Promise<void> {
        this.outputChannel.appendLine(`Generating diagnostics for ${changes.document.uri.toString()}, isChangeEvent: ${changes.contentChanges.length > 0}`);
    }

    public async provideFullDiagnostics(editor: vscode.TextEditor): Promise<void> {
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
    
        this.diagnosticCollection.set(doc.uri, diagnostics);
    }

    private createRemoveDuplicateFix(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction {
        const fix = new vscode.CodeAction('Remove duplicate attribute', vscode.CodeActionKind.QuickFix);
        fix.edit = new vscode.WorkspaceEdit();
        fix.edit.delete(document.uri, range);
        return fix;
    }
}