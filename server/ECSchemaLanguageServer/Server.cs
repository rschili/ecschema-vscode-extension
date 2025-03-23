using Draco.Lsp.Model;
using Draco.Lsp.Server;

namespace ECSchemaLanguageServer;


public class Server : ILanguageServer
{
    public readonly ILanguageClient Client;
    public IList<WorkspaceFolder>? WorkspaceFolders { get; private set; }

    public Server(ILanguageClient client)
    {
        Client = client;
    }

    public InitializeResult.ServerInfoResult? Info => new() {
        Name = "ECSchema Language Server",
        Version = "0.0.1"
    };

    public IList<DocumentFilter> DocumentSelector => [
        new DocumentFilter {
            Language = "ecschema",
            Pattern = "**/*.ecschema.xml"
        }
    ];

    public void Dispose() {}

    public async Task InitializeAsync(InitializeParams param)
    {
        WorkspaceFolders = param.WorkspaceFolders;
        await Client.LogMessageAsync(MessageType.Info, "ECSchema Language Server Initialized");
    }

    public Task InitializedAsync(InitializedParams param) => Task.CompletedTask;

    public Task ShutdownAsync() => Task.CompletedTask;

}