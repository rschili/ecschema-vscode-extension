import * as vscode from 'vscode';
import {legend, CombinedProvider } from './CombinedProvider';

export function activate(context: vscode.ExtensionContext) {
    const selector: vscode.DocumentFilter = { language: 'xml', pattern: '**/*.ecschema.xml' };
    const provider = new CombinedProvider();
    const diagnosticCollection = vscode.languages.createDiagnosticCollection("ecschema");

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

    if (vscode.window.activeTextEditor) { // Immediately generate diagnostics
        provider.provideDiagnostics(vscode.window.activeTextEditor.document, diagnosticCollection);
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                provider.provideDiagnostics(editor.document, diagnosticCollection);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(e => provider.provideDiagnostics(e.document, diagnosticCollection))
    );

    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument(doc => diagnosticCollection.delete(doc.uri))
    );
}