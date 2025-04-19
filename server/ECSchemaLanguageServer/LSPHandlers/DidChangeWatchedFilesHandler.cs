using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using OmniSharp.Extensions.LanguageServer.Protocol.Client.Capabilities;
using OmniSharp.Extensions.LanguageServer.Protocol.Models;
using OmniSharp.Extensions.LanguageServer.Protocol.Workspace;

namespace ECSchemaLanguageServer;
/// <summary>
/// Notifies on changed files so we can update the cache
/// </summary>
internal class DidChangeWatchedFilesHandler : IDidChangeWatchedFilesHandler
{
    private readonly ILogger _logger;
    public Workspace Workspace { get; }
    public DidChangeWatchedFilesHandler(ILogger<SemanticTokensHandler> logger, Workspace workspace)
    {
        _logger = logger;
        Workspace = workspace;
    }

    public DidChangeWatchedFilesRegistrationOptions GetRegistrationOptions(DidChangeWatchedFilesCapability capability, ClientCapabilities clientCapabilities)
    {
        _logger.LogInformation("Getting registration options with capabilities for DidChangeWatchedFiles.");
        return new DidChangeWatchedFilesRegistrationOptions();
    }

    public Task<Unit> Handle(DidChangeWatchedFilesParams request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling DidChangeWatchedFiles event with {ChangesCount} changes.", request.Changes.Count());
        return Unit.Task;
    }

}