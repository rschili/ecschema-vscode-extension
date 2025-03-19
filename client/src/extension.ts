import * as vscode from 'vscode';
import { ECSchemaExtension } from './ECSchemaExtension';
import { legend } from './SemanticTokens';

export function activate(context: vscode.ExtensionContext) {
    const selector: vscode.DocumentFilter = { language: 'ecschema' };
    const outputChannel = vscode.window.createOutputChannel('ECSchema Extension');
    const diagnosticCollection = vscode.languages.createDiagnosticCollection("ecschema");
    const provider = new ECSchemaExtension(outputChannel, diagnosticCollection);
    
    outputChannel.appendLine('ECSchema extension activated');

    const subscriptions = [
        vscode.languages.registerDocumentSemanticTokensProvider(selector, provider, legend),
        vscode.languages.registerCodeActionsProvider(selector, provider, {
            providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
        }),
        vscode.languages.registerCompletionItemProvider(selector, provider, '<'),
        vscode.languages.registerHoverProvider(selector, provider),
        vscode.languages.registerDefinitionProvider(selector, provider),
        diagnosticCollection
    ];

    subscriptions.forEach(subscription => context.subscriptions.push(subscription));

    // Handle asynchronous diagnostics generation for the active editor
    /*if (vscode.window.activeTextEditor) {
        provider.provideFullDiagnostics(vscode.window.activeTextEditor).catch(err => {
            outputChannel.appendLine(`Error generating diagnostics during activation: ${err.message}`);
        });
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(async editor => {
            if (editor) {
                try {
                    await provider.provideFullDiagnostics(editor);
                } catch (err: any) {
                    outputChannel.appendLine(`Error generating diagnostics for active editor: ${err.message}`);
                }
            }
        })
    );*/

    /*context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(async e => {
            try {
                await provider.provideDiagnosticsAfterChange(e);
            } catch (err: any) {
                outputChannel.appendLine(`Error generating diagnostics for changed document: ${err.message}`);
            }
        })
    );*/

    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument(doc => {
            diagnosticCollection.delete(doc.uri);
        })
    );
}