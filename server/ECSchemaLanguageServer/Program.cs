﻿using OmniSharp.Extensions.LanguageServer.Protocol.Models;
using OmniSharp.Extensions.LanguageServer.Server;
using ECSchemaLanguageServer;
using Microsoft.Extensions.Configuration;
using OmniSharp.Extensions.LanguageServer.Protocol.Window;
using OmniSharp.Extensions.LanguageServer.Protocol.Workspace;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using ECSchemaLanguageServer.Services;

var server = await LanguageServer.From(options =>
    options
        .WithInput(Console.OpenStandardInput())
        .WithOutput(Console.OpenStandardOutput())
        .ConfigureLogging(x => x
            .AddLanguageProtocolLogging().SetMinimumLevel(LogLevel.Debug))
            
        .WithHandler<TextDocumentHandler>()
        .WithHandler<DidChangeWatchedFilesHandler>()
        .WithHandler<FoldingRangeHandler>()
        .WithHandler<WorkspaceSymbolsHandler>()
        .WithHandler<DocumentSymbolHandler>()
        .WithHandler<SemanticTokensHandler>()
        .WithServices(x => x.AddLogging(b => b.SetMinimumLevel(LogLevel.Trace)))
        .WithServices(services =>
            {
                services.AddSingleton<ECSchemaService>();
            }
        )
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