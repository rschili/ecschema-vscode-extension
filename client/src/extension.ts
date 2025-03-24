import * as vscode from 'vscode';
import * as lsp from "vscode-languageclient/node";

interface IDotnetAcquireResult {
    dotnetPath: string;
}

let client: lsp.LanguageClient;
export async function activate(context: vscode.ExtensionContext) {
    // make sure dotnet is installed
    await vscode.commands.executeCommand('dotnet.showAcquisitionLog');
    // Console app requires .NET Core 2.2.0
    const commandRes = await vscode.commands.executeCommand<IDotnetAcquireResult>('dotnet.acquire', { version: '9.0', requestingExtensionId: 'ecschema-vscode-extension' });
    const dotnetPath = commandRes!.dotnetPath;
    if (!dotnetPath || typeof dotnetPath !== 'string')
    {
        throw new Error('Could not resolve the dotnet path!');
    }

    const dllPath = `${process.cwd()}/server/ECSchemaLanguageServer/bin/Debug/net9.0/ECSchemaLanguageServer.dll`;
    if (!require('fs').existsSync(dllPath)) {
        console.error(`DLL not found at path: ${dllPath}`);
        process.exit(1);
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