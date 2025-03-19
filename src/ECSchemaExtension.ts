
import * as vscode from 'vscode';
import { encodeTokenModifiers, encodeTokenType, legend, TokenModifier, TokenType } from "./SemanticTokens";
import { DocumentCache, DocumentCacheEntry } from "./Cache";
import { getRangeForNode, isElement, isAttribute, getPositionDataForNode } from './Xml';
import { ecschemaOutline3_2, Element } from './ECSchemaOutline';
import { Node } from "@xmldom/xmldom";
import { createDiagnosticWithoutPosition } from './VSCodeHelpers';

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
            this.diagnosticCollection.set(document.uri, [
                createDiagnosticWithoutPosition('Root node ECSchema expected', vscode.DiagnosticSeverity.Error)
            ]);
            return undefined;
        }
        if(cacheEntry.isDirty) {
            return undefined; // cannot provide anything right now
        }
        cacheEntry.diagnostics = [];

        const builder = new vscode.SemanticTokensBuilder(legend);
        const rootNode = cacheEntry.xml.firstChild?.nextSibling?.nextSibling;
        if(!rootNode) {
            return undefined;
        }
        const rootName = rootNode?.localName;
        if (rootName !== 'ECSchema') {
            const range = getRangeForNode(rootNode);
            cacheEntry.diagnostics.push(new vscode.Diagnostic(range, 'Root node ECSchema expected', vscode.DiagnosticSeverity.Error));
            this.diagnosticCollection.set(document.uri, cacheEntry.diagnostics);
            return undefined;
        }

        let tokens: vscode.SemanticTokens;
        try {
        this.TokenizeElement(builder, rootNode, cacheEntry);
        tokens = builder.build();
        this.diagnosticCollection.set(document.uri, cacheEntry.diagnostics);
        } catch (e: any) {
            this.outputChannel.appendLine(`Error building semantic tokens: ${e.message}`);
            return undefined;
        }

        this.outputChannel.appendLine(`Returning semantic tokens`);
        return tokens;
    }

    private TokenizeElement(builder: vscode.SemanticTokensBuilder, element: Node, cacheEntry: DocumentCacheEntry) {
        if(element.localName === null) {
            return;
        }

        const outline = ecschemaOutline3_2[element.localName];
        if(!outline) {
            const range = getRangeForNode(element);
            const diagnostic = new vscode.Diagnostic(range, `Unexpected element: ${element.localName}`, vscode.DiagnosticSeverity.Warning);
            cacheEntry.diagnostics.push(diagnostic);
            return;
        }

        this.AddSemanticToken(builder, element, outline.tokenType, TokenModifier.Declaration);
        if(element.hasChildNodes()) {
            for(const child of element.childNodes) {
                if(isElement(child) && child.localName !== null) {
                    if(outline.allowedChildren !== undefined && outline.allowedChildren.includes(child.localName)) {
                        this.TokenizeElement(builder, child, cacheEntry);
                    } else {
                        const range = getRangeForNode(child);
                        const diagnostic = new vscode.Diagnostic(range, `Unexpected child element: ${child.localName}`, vscode.DiagnosticSeverity.Warning);
                        cacheEntry.diagnostics.push(diagnostic);
                    }
                } else if(isAttribute(child)) {
                    
                }
            }
        }
    }

    private AddSemanticToken(builder: vscode.SemanticTokensBuilder, node: Node, tokenType: TokenType, tokenModifier?: TokenModifier) {
        const positionData = getPositionDataForNode(node);
        builder.push(positionData.line, positionData.char, positionData.length, encodeTokenType(tokenType), tokenModifier ? encodeTokenModifiers(tokenModifier) : undefined);
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
         
    }

    private createRemoveDuplicateFix(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction {
        const fix = new vscode.CodeAction('Remove duplicate attribute', vscode.CodeActionKind.QuickFix);
        fix.edit = new vscode.WorkspaceEdit();
        fix.edit.delete(document.uri, range);
        return fix;
    }
}