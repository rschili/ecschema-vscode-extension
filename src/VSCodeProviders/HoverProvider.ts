import * as vscode from 'vscode';
import { BaseProvider } from './BaseProvider';
import { ecschemaOutline3_2 } from '../ECSchemaOutline';

export class HoverProvider extends BaseProvider implements vscode.HoverProvider {
    public async provideHover(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Hover | undefined> {
        this.context.outputChannel.appendLine(`Providing hover for ${document.uri.toString()}, position: ${position.line}:${position.character}`);
        const cacheEntry = await this.context.documentCache.getEntry(document.uri);
        if (!cacheEntry) {
            this.context.outputChannel.appendLine(`Document not in cache`);
            return undefined;
        }

        const hoverNode = cacheEntry.findNodeByPosition(position.line + 1, position.character);
        if (!hoverNode) {
            this.context.outputChannel.appendLine(`No node found at position`);
            return undefined;
        }

        if (hoverNode.nodeType === 1 && hoverNode.localName !== null) {
            const outline = ecschemaOutline3_2[hoverNode.localName];
            if (outline) {
                return new vscode.Hover(outline.description);
            }
        }

        this.context.outputChannel.appendLine(`No hover information found`);
        return undefined;
    }
}