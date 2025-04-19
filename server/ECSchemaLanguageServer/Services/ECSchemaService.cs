using Microsoft.Extensions.Logging;
using OmniSharp.Extensions.LanguageServer.Protocol.Models;
using OmniSharp.Extensions.LanguageServer.Protocol.Server;

namespace ECSchemaLanguageServer.Services;

public class ECSchemaService
{
    public readonly ILogger<ECSchemaService> Logger;
    public readonly ILanguageServerFacade Server;
    public ECSchemaService(ILanguageServerFacade server, ILogger<ECSchemaService> logger)
    {
        Server = server ?? throw new ArgumentNullException(nameof(server));
        Logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public readonly Workspace Workspace = new();

}