using OmniSharp.Extensions.LanguageServer.Protocol;

namespace ECSchemaLanguageServer;

public class SchemaDocument
{
    public readonly DocumentUri Uri;
    public SyntaxTree? SyntaxTree { get; set; }

    public SchemaDocument(DocumentUri uri)
    {
        Uri = uri;
    }

}