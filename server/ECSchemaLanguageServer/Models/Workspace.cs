using System.Collections.Concurrent;
using OmniSharp.Extensions.LanguageServer.Protocol;
using OmniSharp.Extensions.LanguageServer.Protocol.Models;

namespace ECSchemaLanguageServer;

public class Workspace
{
    public ConcurrentDictionary<DocumentUri, SchemaDocument> Documents { get; } = new();
    public Workspace()
    {
    }

    public SyntaxTree GetSyntaxTree()
    {
        return new SyntaxTree();
    }

    public SchemaDocument GetOrCreateSchemaDocument(DocumentUri uri, CancellationToken cancellationToken)
    {
        return Documents.GetOrAdd(uri, _ => new SchemaDocument(uri));
    }
}