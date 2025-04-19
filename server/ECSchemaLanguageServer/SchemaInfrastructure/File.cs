using OmniSharp.Extensions.LanguageServer.Protocol;

namespace ECSchemaLanguageServer;

public class File
{
    public readonly DocumentUri Uri;
    public SyntaxTree? SyntaxTree { get; set; }

    public File(DocumentUri uri)
    {
        Uri = uri;
    }

}