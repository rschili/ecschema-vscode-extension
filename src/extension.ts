import * as vscode from 'vscode';
import { Context } from './VSCodeProviders/Context';
import { legend } from './SemanticTokens';
import { SemanticTokensProvider } from "./VSCodeProviders/SemanticTokensProvider";
import { CodeActionProvider } from "./VSCodeProviders/CodeActionProvider";
import { CompletionItemProvider } from "./VSCodeProviders/CompletionProvider";
import { HoverProvider } from "./VSCodeProviders/HoverProvider";
import { DefinitionProvider } from "./VSCodeProviders/DefinitionProvider";

export function activate(context: vscode.ExtensionContext) {
    const selector: vscode.DocumentFilter = { language: 'xml', pattern: '**/*.ecschema.xml' };
    const outputChannel = vscode.window.createOutputChannel('ECSchema extension');
    const diagnosticCollection = vscode.languages.createDiagnosticCollection("ecschema");
    const providerContext: Context = new Context(outputChannel, diagnosticCollection);

    outputChannel.appendLine('ECSchema extension activated');

    const subscriptions = [
        vscode.languages.registerDocumentSemanticTokensProvider(selector, new SemanticTokensProvider(providerContext), legend),
        vscode.languages.registerCodeActionsProvider(selector, new CodeActionProvider(providerContext), {
            providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
        }),
        vscode.languages.registerCompletionItemProvider(selector, new CompletionItemProvider(providerContext), '<'),
        vscode.languages.registerHoverProvider(selector, new HoverProvider(providerContext)),
        vscode.languages.registerDefinitionProvider(selector, new DefinitionProvider(providerContext)),
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