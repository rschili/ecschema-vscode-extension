import * as vscode from 'vscode';
import * as lsp from "vscode-languageclient/node";

let client: lsp.LanguageClient;
export async function activate(context: vscode.ExtensionContext) {
    let serverOptions: lsp.ServerOptions = {
        command: "dotnet",
        args: [
            "run",
            "/home/rob/code/ecschema-vscode-extension/server/ECSchemaLanguageServer/ECSchemaLanguageServer.csproj",
            "--debug"
        ],
        transport: lsp.TransportKind.stdio,
        options: {
            shell: true
        }
    }

    let clientOptions: lsp.LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'ecschema' }],
    }
    client = new lsp.LanguageClient("ecschema", "ECSchema Language Server", serverOptions, clientOptions);
    client.registerProposedFeatures();
    client.setTrace(lsp.Trace.Verbose);
    await client.start();
}

export function deactivate() {
    return client.stop();
}