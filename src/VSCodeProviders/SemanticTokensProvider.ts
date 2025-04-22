import * as vscode from 'vscode';
import { BaseProvider } from './BaseProvider';
import { legend, TokenModifier, TokenType, encodeTokenType, encodeTokenModifiers } from '../SemanticTokens';
import { getRangeForNode } from '../Xml';
import { ecschemaOutline3_2 } from '../ECSchemaOutline';
import { createDiagnosticWithoutPosition } from '../VSCodeHelpers';

export class SemanticTokensProvider extends BaseProvider implements vscode.DocumentSemanticTokensProvider {
    public async provideDocumentSemanticTokens(document: vscode.TextDocument, _token: vscode.CancellationToken): Promise<vscode.SemanticTokens | undefined> {
        this.context.outputChannel.appendLine(`Providing semantic tokens for ${document.uri.toString()}`);
        let cacheEntry;
        try {
            cacheEntry = await this.context.documentCache.getOrCreateEntry(document.uri, document);
        } catch (e: any) {
            this.context.outputChannel.appendLine(`Error getting document cache entry: ${e.message}`);
            this.context.diagnosticCollection.set(document.uri, [
                createDiagnosticWithoutPosition('Root node ECSchema expected', vscode.DiagnosticSeverity.Error)
            ]);
            return undefined;
        }

        if (cacheEntry.isDirty) {
            return undefined;
        }

        const builder = new vscode.SemanticTokensBuilder(legend);
        const rootNode = cacheEntry.xml.firstChild?.nextSibling?.nextSibling;
        if (!rootNode || rootNode.localName !== 'ECSchema') {
            const range = getRangeForNode(rootNode);
            cacheEntry.diagnostics.push(new vscode.Diagnostic(range, 'Root node ECSchema expected', vscode.DiagnosticSeverity.Error));
            this.context.diagnosticCollection.set(document.uri, cacheEntry.diagnostics);
            return undefined;
        }

        try {
            this.tokenizeElement(builder, rootNode, cacheEntry);
            this.context.diagnosticCollection.set(document.uri, cacheEntry.diagnostics);
            return builder.build();
        } catch (e: any) {
            this.context.outputChannel.appendLine(`Error building semantic tokens: ${e.message}`);
            return undefined;
        }
    }

    private tokenizeElement(builder: vscode.SemanticTokensBuilder, element: Node, cacheEntry: any) {
        const outline = ecschemaOutline3_2[element.localName];
        if (!outline) {
            const range = getRangeForNode(element);
            const diagnostic = new vscode.Diagnostic(range, `Unexpected element: ${element.localName}`, vscode.DiagnosticSeverity.Warning);
            cacheEntry.diagnostics.push(diagnostic);
            return;
        }

        this.addSemanticToken(builder, element, outline.tokenType, TokenModifier.Declaration);
    }

    private addSemanticToken(builder: vscode.SemanticTokensBuilder, node: Node, tokenType: TokenType, tokenModifier?: TokenModifier) {
        const positionData = { line: 0, char: 0, length: 0 }; // Replace with actual position data
        builder.push(positionData.line, positionData.char, positionData.length, encodeTokenType(tokenType), tokenModifier ? encodeTokenModifiers(tokenModifier) : undefined);
    }
}