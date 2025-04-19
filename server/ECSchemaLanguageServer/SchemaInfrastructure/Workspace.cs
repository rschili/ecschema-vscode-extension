using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;
using OmniSharp.Extensions.LanguageServer.Protocol;
using OmniSharp.Extensions.LanguageServer.Protocol.Models;
using OmniSharp.Extensions.LanguageServer.Protocol.Server;

namespace ECSchemaLanguageServer;

public class Workspace
{
    public ConcurrentDictionary<DocumentUri, File> Documents { get; } = new();
    public readonly ILogger Logger;
    public readonly ILanguageServerFacade Server;
    public Workspace(ILanguageServerFacade server, ILogger<Workspace> logger)
    {
        Server = server ?? throw new ArgumentNullException(nameof(server));
        Logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }


    public File GetOrCreateFile(DocumentUri uri, CancellationToken cancellationToken)
    {
        return Documents.GetOrAdd(uri, _ => new File(uri));
    }
}