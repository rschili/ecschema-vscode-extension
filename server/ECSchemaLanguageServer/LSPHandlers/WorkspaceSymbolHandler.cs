using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using OmniSharp.Extensions.LanguageServer.Protocol;
using OmniSharp.Extensions.LanguageServer.Protocol.Client.Capabilities;
using OmniSharp.Extensions.LanguageServer.Protocol.Document;
using OmniSharp.Extensions.LanguageServer.Protocol.Models;
using OmniSharp.Extensions.LanguageServer.Protocol.Progress;
using OmniSharp.Extensions.LanguageServer.Protocol.Server;
using OmniSharp.Extensions.LanguageServer.Protocol.Server.Capabilities;
using OmniSharp.Extensions.LanguageServer.Protocol.Server.WorkDone;
using OmniSharp.Extensions.LanguageServer.Protocol.Workspace;
using Range = OmniSharp.Extensions.LanguageServer.Protocol.Models.Range;


#pragma warning disable CS0618

namespace ECSchemaLanguageServer;

internal class WorkspaceSymbolsHandler : IWorkspaceSymbolsHandler
{
    private readonly IServerWorkDoneManager _serverWorkDoneManager;
    private readonly IProgressManager _progressManager;

    private readonly ILogger _logger;
    public Workspace Workspace { get; }

    public WorkspaceSymbolsHandler(IServerWorkDoneManager serverWorkDoneManager, IProgressManager progressManager, ILogger<WorkspaceSymbolsHandler> logger, Workspace workspace)
    {
        _serverWorkDoneManager = serverWorkDoneManager;
        _progressManager = progressManager;
        _logger = logger;
        Workspace = workspace;
    }

    public WorkspaceSymbolRegistrationOptions GetRegistrationOptions(WorkspaceSymbolCapability capability, ClientCapabilities clientCapabilities) => new WorkspaceSymbolRegistrationOptions();

    public async Task<Container<WorkspaceSymbol>?> Handle(WorkspaceSymbolParams request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling WorkspaceSymbol request for {Query}", request.Query);
        using var reporter = _serverWorkDoneManager.For(
            request, new WorkDoneProgressBegin
            {
                Cancellable = true,
                Message = "This might take a while...",
                Title = "Some long task....",
                Percentage = 0
            }
        );
        using var partialResults = _progressManager.For<Container<WorkspaceSymbol>, WorkspaceSymbol>(request as IPartialItemsRequest<Container<WorkspaceSymbol>, WorkspaceSymbol>, cancellationToken);
        if (partialResults != null)
        {
            await Task.Delay(2000, cancellationToken).ConfigureAwait(false);

            reporter.OnNext(
                new WorkDoneProgressReport
                {
                    Cancellable = true,
                    Percentage = 20
                }
            );
            await Task.Delay(500, cancellationToken).ConfigureAwait(false);

            reporter.OnNext(
                new WorkDoneProgressReport
                {
                    Cancellable = true,
                    Percentage = 40
                }
            );
            await Task.Delay(500, cancellationToken).ConfigureAwait(false);

            reporter.OnNext(
                new WorkDoneProgressReport
                {
                    Cancellable = true,
                    Percentage = 50
                }
            );
            await Task.Delay(500, cancellationToken).ConfigureAwait(false);

            partialResults.OnNext(
                new[] {
                        new WorkspaceSymbol {
                            ContainerName = "Partial Container",
                            Kind = SymbolKind.Constant,
                            Location = new Location {
                                Range = new Range(
                                    new Position(2, 1),
                                    new Position(2, 10)
                                )
                            },
                            Name = "Partial name"
                        }
                }
            );

            reporter.OnNext(
                new WorkDoneProgressReport
                {
                    Cancellable = true,
                    Percentage = 70
                }
            );
            await Task.Delay(500, cancellationToken).ConfigureAwait(false);

            reporter.OnNext(
                new WorkDoneProgressReport
                {
                    Cancellable = true,
                    Percentage = 90
                }
            );

            partialResults.OnCompleted();
            return new WorkspaceSymbol[] { };
        }

        try
        {
            return new[] {
                    new WorkspaceSymbol {
                        ContainerName = "Container",
                        Kind = SymbolKind.Constant,
                        Location = new Location {
                            Range = new Range(
                                new Position(1, 1),
                                new Position(1, 10)
                            )
                        },
                        Name = "name"
                    }
                };
        }
        finally
        {
            reporter.OnNext(
                new WorkDoneProgressReport
                {
                    Cancellable = true,
                    Percentage = 100
                }
            );
        }
    }
}