import * as vscode from 'vscode';
import { BaseProvider } from './BaseProvider';

const REQUIRED_ATTRIBUTES = ['schemaName', 'alias', 'version', 'description', 'displayLabel', 'xmlns'];

export class CompletionItemProvider extends BaseProvider implements vscode.CompletionItemProvider {
    public async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[] | undefined> {
        this.context.outputChannel.appendLine(`Providing completions for ${document.uri.toString()}`);
        const lineText = document.lineAt(position).text;
        if (!lineText.includes('<ECSchema')) {
            return undefined;
        }

        const missingAttributes = REQUIRED_ATTRIBUTES.filter(attr => !lineText.includes(attr));
        return missingAttributes.map(attr => new vscode.CompletionItem(attr, vscode.CompletionItemKind.Property));
    }
}