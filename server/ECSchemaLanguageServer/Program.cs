﻿using OmniSharp.Extensions.LanguageServer.Protocol.Models;
using OmniSharp.Extensions.LanguageServer.Server;
using ECSchemaLanguageServer;
using Microsoft.Extensions.Configuration;
using OmniSharp.Extensions.LanguageServer.Protocol.Window;

var server = await LanguageServer.From(options =>
    options
        .WithInput(Console.OpenStandardInput())
        .WithOutput(Console.OpenStandardOutput())
        .WithHandler<TextDocumentHandler>()
        .WithHandler<DidChangeWatchedFilesHandler>()
        .WithHandler<FoldingRangeHandler>()
        .WithHandler<WorkspaceSymbolsHandler>()
        .WithHandler<DocumentSymbolHandler>()
        .WithHandler<SemanticTokensHandler>()
        .OnInitialize(
            (server, request, token) =>
            {
                server.Window.SendNotification(
                    new ShowMessageParams
                    {
                        Type = MessageType.Info,
                        Message = "ECSchema language server is initializing...",
                    }
                );
                server.Window.LogInfo("ECSchema language server is initializing...");
                return Task.CompletedTask;
            }
        )
).ConfigureAwait(false);

await server.WaitForExit.ConfigureAwait(false);