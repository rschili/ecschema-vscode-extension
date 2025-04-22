import * as vscode from 'vscode';
import { DocumentCache } from '../Cache';

export class Context {
    public readonly outputChannel: vscode.OutputChannel;
    public readonly documentCache: DocumentCache;
    public readonly diagnosticCollection: vscode.DiagnosticCollection;

    constructor(outputChannel: vscode.OutputChannel, diagnosticCollection: vscode.DiagnosticCollection) {
        this.outputChannel = outputChannel;
        this.documentCache = new DocumentCache(outputChannel);
        this.diagnosticCollection = diagnosticCollection;
    }
}