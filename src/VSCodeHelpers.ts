import * as vscode from 'vscode';

/**
 * Creates a diagnostic with a default position (0,0).
 * @param message The diagnostic message.
 * @param severity The diagnostic severity (default is vscode.DiagnosticSeverity.Error).
 * @returns A vscode.Diagnostic object pointing to position (0,0).
 */
export function createDiagnosticWithoutPosition(
    message: string,
    severity: vscode.DiagnosticSeverity = vscode.DiagnosticSeverity.Error): vscode.Diagnostic {
    const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0));
    return new vscode.Diagnostic(range, message, severity);
}