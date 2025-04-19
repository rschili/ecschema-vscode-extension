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

internal class DocumentSymbolHandler : IDocumentSymbolHandler
{
    private readonly ILogger _logger;
    public Workspace Workspace { get; }
    public DocumentSymbolHandler(ILogger<SemanticTokensHandler> logger, Workspace workspace)
    {
        _logger = logger;
        Workspace = workspace;
    }

    public DocumentSymbolRegistrationOptions GetRegistrationOptions(DocumentSymbolCapability capability, ClientCapabilities clientCapabilities) => new DocumentSymbolRegistrationOptions
    {
        DocumentSelector = TextDocumentSelector.ForLanguage("csharp")
    };

    async Task<SymbolInformationOrDocumentSymbolContainer?> IRequestHandler<DocumentSymbolParams, SymbolInformationOrDocumentSymbolContainer?>.Handle(DocumentSymbolParams request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling DocumentSymbol request for {DocumentUri}", request.TextDocument.Uri);
        // you would normally get this from a common source that is managed by current open editor, current active editor, etc.
        var content = await System.IO.File.ReadAllTextAsync(DocumentUri.GetFileSystemPath(request)!, cancellationToken).ConfigureAwait(false);
        var lines = content.Split('\n');
        var symbols = new List<SymbolInformationOrDocumentSymbol>();
        for (var lineIndex = 0; lineIndex < lines.Length; lineIndex++)
        {
            var line = lines[lineIndex];
            var parts = line.Split(' ', '.', '(', ')', '{', '}', '[', ']', ';');
            var currentCharacter = 0;
            foreach (var part in parts)
            {
                if (string.IsNullOrWhiteSpace(part))
                {
                    currentCharacter += part.Length + 1;
                    continue;
                }

                symbols.Add(
                    new DocumentSymbol
                    {
                        Detail = part,
                        Deprecated = true,
                        Kind = SymbolKind.Field,
                        Tags = new[] { SymbolTag.Deprecated },
                        Range = new Range(
                            new Position(lineIndex, currentCharacter),
                            new Position(lineIndex, currentCharacter + part.Length)
                        ),
                        SelectionRange =
                            new Range(
                                new Position(lineIndex, currentCharacter),
                                new Position(lineIndex, currentCharacter + part.Length)
                            ),
                        Name = part
                    }
                );
                currentCharacter += part.Length + 1;
            }
        }

        // await Task.Delay(2000, cancellationToken);
        return symbols;
    }
}
