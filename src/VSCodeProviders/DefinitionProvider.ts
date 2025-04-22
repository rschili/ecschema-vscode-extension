import * as vscode from 'vscode';
import { BaseProvider } from './BaseProvider';

export class DefinitionProvider extends BaseProvider implements vscode.DefinitionProvider {
    public async provideDefinition(document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken): Promise<vscode.Definition | undefined> {
        this.context.outputChannel.appendLine(`Providing definition for ${document.uri.toString()}`);
        const range = document.getWordRangeAtPosition(position, /<ECSchema[^>]*>/);
        if (range) {
            return new vscode.Location(document.uri, range);
        }
        return undefined;
    }
}