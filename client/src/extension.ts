import * as vscode from 'vscode';
import * as lsp from "vscode-languageclient/node";

interface IDotnetAcquireResult {
    dotnetPath: string;
}

let client: lsp.LanguageClient;
export async function activate(context: vscode.ExtensionContext) {
    const version = '9.0';
    const requestingExtensionId = 'ecschema-vscode-extension';
    // make sure dotnet is installed
    let status = await vscode.commands.executeCommand<IDotnetAcquireResult>('dotnet.acquireStatus',  {version, requestingExtensionId });
    if(!status || !status.dotnetPath || typeof status.dotnetPath !== 'string') {
        vscode.window.showErrorMessage(`.NET version ${version} is required to run the ECSchema Language Server. Will now try to download it. This should only happen once.`);
        status = await vscode.commands.executeCommand<IDotnetAcquireResult>('dotnet.acquire', { version, requestingExtensionId });
    }
    if(!status || !status.dotnetPath || typeof status.dotnetPath !== 'string') {
        vscode.window.showErrorMessage(`Failed to download .NET version ${version}. ECSchema Language Server will not work.`);
        return;
    }
    const dotnetPath = status.dotnetPath;
    const dllPath = `${process.cwd()}/server/ECSchemaLanguageServer/bin/Debug/net9.0/ECSchemaLanguageServer.dll`;
    if (!require('fs').existsSync(dllPath)) {
        vscode.window.showErrorMessage(`DLL not found at path: ${dllPath}`);
        return;
    }
    
    let serverOptions: lsp.ServerOptions = {
        command: dotnetPath, //"dotnet"
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

    client = new lsp.LanguageClient("ecschema", "ECSchema Language Server", serverOptions, clientOptions);
    client.registerProposedFeatures();
    client.setTrace(lsp.Trace.Verbose);
    await client.start();
}

export function deactivate() {
    return client.stop();
}