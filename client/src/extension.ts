import * as vscode from 'vscode';
import * as lsp from "vscode-languageclient/node";

let client: lsp.LanguageClient;
export async function activate(context: vscode.ExtensionContext) {
    const dllPath = `${process.cwd()}/server/ECSchemaLanguageServer/bin/Debug/net9.0/linux-x64/ECSchemaLanguageServer.dll`;
    if (!require('fs').existsSync(dllPath)) {
        console.error(`DLL not found at path: ${dllPath}`);
        process.exit(1);
    }
    
    let serverOptions: lsp.ServerOptions = {
        command: "dotnet",
        args: [
            dllPath
        ],
        transport: lsp.TransportKind.stdio,
        options: {
            shell: true
        }
    }

    let clientOptions: lsp.LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'ecschema' }],
        progressOnInitialization: true,
    }
    console.log(`Current working directory: ${process.cwd()}`);
    console.log(`Executing file: ${__filename}`);
    client = new lsp.LanguageClient("ecschema", "ECSchema Language Server", serverOptions, clientOptions);
    client.registerProposedFeatures();
    client.setTrace(lsp.Trace.Verbose);
    await client.start();
}

export function deactivate() {
    return client.stop();
}