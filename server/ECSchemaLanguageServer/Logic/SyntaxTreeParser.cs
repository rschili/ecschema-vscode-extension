using System.Xml;
using OmniSharp.Extensions.LanguageServer.Protocol;
using TurboXml;

namespace ECSchemaLanguageServer;

public static class SyntaxTreeParser
{
    public static async Task<SyntaxTree> ParseAsync(DocumentUri uri, CancellationToken cancellationToken)
    {
        var path = DocumentUri.GetFileSystemPath(uri);
        if(path == null || !File.Exists(path))
        {
            return new SyntaxTree();
        }

        var text = await File.ReadAllTextAsync(path, cancellationToken).ConfigureAwait(false);
        var handler = new XmlHandler();
        XmlParser.Parse(text, ref handler);
        return handler.Result;
    }

    private struct XmlHandler : IXmlReadHandler
    {
        public XmlHandler()
        {
        }

        public SyntaxTree Result { get; } = new();

        void OnXmlDeclaration(ReadOnlySpan<char> version, ReadOnlySpan<char> encoding, ReadOnlySpan<char> standalone, int line, int column)
        {
        }

        void OnBeginTag(ReadOnlySpan<char> name, int line, int column)
        {
        }

        void OnEndTagEmpty()
        {
        }

        void OnEndTag(ReadOnlySpan<char> name, int line, int column)
        {
        }

        void OnAttribute(ReadOnlySpan<char> name, ReadOnlySpan<char> value, int nameLine, int nameColumn, int valueLine, int valueColumn)
        {
        }

        void OnText(ReadOnlySpan<char> text, int line, int column)
        {
        }

        void OnComment(ReadOnlySpan<char> comment, int line, int column)
        {
        }

        void OnCData(ReadOnlySpan<char> cdata, int line, int column)
        {
        }

        void OnError(string message, int line, int column)
        {
            throw new XmlException($"Error at line {line}, column {column}: {message}");
        }
    }
}


