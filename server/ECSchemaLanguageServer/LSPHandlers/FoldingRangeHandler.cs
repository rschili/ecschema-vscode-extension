using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using OmniSharp.Extensions.LanguageServer.Protocol.Client.Capabilities;
using OmniSharp.Extensions.LanguageServer.Protocol.Document;
using OmniSharp.Extensions.LanguageServer.Protocol.Models;

namespace ECSchemaLanguageServer;
internal class FoldingRangeHandler : IFoldingRangeHandler
{
    private readonly ILogger _logger;
    public Workspace Workspace { get; }
    public FoldingRangeHandler(ILogger<SemanticTokensHandler> logger, Workspace workspace)
    {
        _logger = logger;
        Workspace = workspace;
    }

    public FoldingRangeRegistrationOptions GetRegistrationOptions(FoldingRangeCapability capability, ClientCapabilities clientCapabilities)
    {
        _logger.LogInformation("GetRegistrationOptions method called with capability: {Capability}, clientCapabilities: {ClientCapabilities}", capability, clientCapabilities);
        return new FoldingRangeRegistrationOptions {
            DocumentSelector = TextDocumentSelector.ForLanguage("ecschema")
        };
    }

    public Task<Container<FoldingRange>?> Handle(
        FoldingRangeRequestParam request,
        CancellationToken cancellationToken
    )
    {
        _logger.LogInformation("Handle method called with request: {Request}", request);
        return Task.FromResult<Container<FoldingRange>?>(
            new Container<FoldingRange>(
                new FoldingRange {
                    StartLine = 10,
                    EndLine = 20,
                    Kind = FoldingRangeKind.Region,
                    EndCharacter = 0,
                    StartCharacter = 0
                }
            )
        );
    }

}