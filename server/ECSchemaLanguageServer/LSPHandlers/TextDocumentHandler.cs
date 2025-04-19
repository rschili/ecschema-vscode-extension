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
internal class TextDocumentHandler : TextDocumentSyncHandlerBase
{
    private readonly ILanguageServerConfiguration _configuration;

    private readonly TextDocumentSelector _textDocumentSelector = new TextDocumentSelector(
        new TextDocumentFilter
        {
            Pattern = "**/*.ecschema.xml"
        }
    );
    private readonly ILogger _logger;
    public Workspace Workspace { get; }
    public TextDocumentHandler(ILogger<TextDocumentHandler> logger, Workspace workspace, ILanguageServerConfiguration configuration)
    {
        _logger = logger;
        Workspace = workspace;
        _configuration = configuration;
    }

    protected override TextDocumentSyncRegistrationOptions CreateRegistrationOptions(TextSynchronizationCapability capability, ClientCapabilities clientCapabilities) => new TextDocumentSyncRegistrationOptions()
    {
        DocumentSelector = _textDocumentSelector,
        Change = Change,
        Save = new SaveOptions() { IncludeText = true }
    };

    public TextDocumentSyncKind Change { get; } = TextDocumentSyncKind.Full;

    public override Task<Unit> Handle(DidChangeTextDocumentParams notification, CancellationToken token)
    {
        return Unit.Task;
    }

    public override async Task<Unit> Handle(DidOpenTextDocumentParams notification, CancellationToken token)
    {
        await Task.Yield();
        await _configuration.GetScopedConfiguration(notification.TextDocument.Uri, token).ConfigureAwait(false);
        _logger.LogInformation("Opened document: {DocumentUri}", notification.TextDocument.Uri);
        return Unit.Value;
    }

    public override Task<Unit> Handle(DidCloseTextDocumentParams notification, CancellationToken token)
    {
        if (_configuration.TryGetScopedConfiguration(notification.TextDocument.Uri, out var disposable))
        {
            disposable.Dispose();
        }
        _logger.LogInformation("Closed document: {DocumentUri}", notification.TextDocument.Uri);

        return Unit.Task;
    }

    public override Task<Unit> Handle(DidSaveTextDocumentParams notification, CancellationToken token)
    {
        _logger.LogInformation("Saved document: {DocumentUri}", notification.TextDocument.Uri);
        return Unit.Task;
    }

    public override TextDocumentAttributes GetTextDocumentAttributes(DocumentUri uri)
    {
        _logger.LogInformation("Getting text document attributes for: {DocumentUri}", uri);
        return new TextDocumentAttributes(uri, "ecschema");
    }
}
