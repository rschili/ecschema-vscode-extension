using OmniSharp.Extensions.LanguageServer.Protocol.Models;
using OmniSharp.Extensions.LanguageServer.Server;
using ECSchemaLanguageServer;
using Microsoft.Extensions.Configuration;

IObserver<WorkDoneProgressReport> workDone = null!;
var server = await LanguageServer.From(options =>
    options
        .WithInput(Console.OpenStandardInput())
        .WithOutput(Console.OpenStandardOutput())
        .WithHandler<TextDocumentHandler>()
        .WithHandler<DidChangeWatchedFilesHandler>()
        .WithHandler<FoldingRangeHandler>()
        .WithHandler<WorkspaceSymbolsHandler>()
        .WithHandler<DocumentSymbolHandler>()
        .OnInitialize(
            async (server, request, token) =>
            {
                var manager = server.WorkDoneManager.For(
                    request, new WorkDoneProgressBegin
                    {
                        Title = "Server is starting...",
                        Percentage = 10,
                    }
                );
                workDone = manager;

                await Task.Delay(2000).ConfigureAwait(false);

                manager.OnNext(
                    new WorkDoneProgressReport
                    {
                        Percentage = 20,
                        Message = "loading in progress"
                    }
                );
            }
        )
        .OnInitialized(
            async (server, request, response, token) =>
            {
                workDone.OnNext(
                    new WorkDoneProgressReport
                    {
                        Percentage = 40,
                        Message = "loading almost done",
                    }
                );

                await Task.Delay(2000).ConfigureAwait(false);

                workDone.OnNext(
                    new WorkDoneProgressReport
                    {
                        Message = "loading done",
                        Percentage = 100,
                    }
                );
                workDone.OnCompleted();
            }
        )
        .OnStarted(
            async (languageServer, token) =>
            {
                using var manager = await languageServer.WorkDoneManager.Create(new WorkDoneProgressBegin { Title = "Doing some work..." })
                                                        .ConfigureAwait(false);

                manager.OnNext(new WorkDoneProgressReport { Message = "doing things..." });
                await Task.Delay(10000).ConfigureAwait(false);
                manager.OnNext(new WorkDoneProgressReport { Message = "doing things... 1234" });
                await Task.Delay(10000).ConfigureAwait(false);
                manager.OnNext(new WorkDoneProgressReport { Message = "doing things... 56789" });

                var configuration = await languageServer.Configuration.GetConfiguration(
                    new ConfigurationItem
                    {
                        Section = "typescript",
                    }, new ConfigurationItem
                    {
                        Section = "terminal",
                    }
                ).ConfigureAwait(false);

                foreach (var config in languageServer.Configuration.AsEnumerable())
                {
                    //baseConfig.Add(config.Key, config.Value);
                }

                foreach (var config in configuration.AsEnumerable())
                {
                    //scopedConfig.Add(config.Key, config.Value);
                }
            }
        )
).ConfigureAwait(false);

await server.WaitForExit.ConfigureAwait(false);
