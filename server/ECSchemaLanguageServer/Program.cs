using System.IO.Pipelines;
using Draco.Lsp.Server;
using ECSchemaLanguageServer;

//TODO: Use https://github.com/xoofx/TurboXml?tab=readme-ov-file

//TODO: Use NativeAOT to compile the server

//TODO: Microsoft.Data.Sqlite with journal mode WAL
//PRAGMA journal_mode=WAL;

//TODO: Use Draco LSP https://www.nuget.org/packages/Draco.Lsp/0.4.14-pre
// https://github.com/Draco-lang/Compiler/tree/main

var pipe = new StdioDuplexPipe();
var client = LanguageServer.Connect(pipe);
var server = new Server(client);
await client.RunAsync(server);

sealed class StdioDuplexPipe : IDuplexPipe
{
    public PipeReader Input { get; } = PipeReader.Create(Console.OpenStandardInput());

    public PipeWriter Output { get; } = PipeWriter.Create(Console.OpenStandardOutput());
}