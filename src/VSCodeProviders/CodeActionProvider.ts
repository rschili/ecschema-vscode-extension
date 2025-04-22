import * as vscode from 'vscode';
import { BaseProvider } from './BaseProvider';

export class CodeActionProvider extends BaseProvider implements vscode.CodeActionProvider {
    public async provideCodeActions(document: vscode.TextDocument, _range: vscode.Range): Promise<vscode.CodeAction[] | undefined> {
        this.context.outputChannel.appendLine(`Providing code actions for ${document.uri.toString()}`);
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