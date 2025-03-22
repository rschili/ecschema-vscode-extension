using ECSchemaLanguageServer;
using System.Diagnostics;
using System.Runtime.InteropServices;

if (!Debugger.IsAttached)
{
    Console.WriteLine($"Waiting for debugger to attach... (Process ID: {Environment.ProcessId})");
    LaunchVSCodeAndAttach(Environment.ProcessId);
    while (!Debugger.IsAttached)
    {
        await Task.Delay(1000); // Wait for the debugger to attach
    }
    Console.WriteLine("Debugger attached.");
}

//TODO: Use https://github.com/xoofx/TurboXml?tab=readme-ov-file

//TODO: Use NativeAOT to compile the server

//TODO: Microsoft.Data.Sqlite with journal mode WAL

//TODO: Use Draco LSP https://www.nuget.org/packages/Draco.Lsp/0.4.14-pre
// https://github.com/Draco-lang/Compiler/tree/main

IObserver<WorkDoneProgressReport> workDone = null!;
using var server = await LanguageServer.From(options =>
    options
        .WithInput(Console.OpenStandardInput())
        .WithOutput(Console.OpenStandardOutput())
        .WithHandler<TextDocumentHandler>()
        .WithHandler<DidChangeWatchedFilesHandler>()
        .WithHandler<FoldingRangeHandler>()
        .WithHandler<WorkspaceSymbolsHandler>()
        .WithHandler<DocumentSymbolHandler>()
        .OnInitialize(
            async (server, request, token) =>
            {
                var manager = server.WorkDoneManager.For(
                    request, new WorkDoneProgressBegin
                    {
                        Title = "Server is starting...",
                        Percentage = 10,
                    }
                );
                workDone = manager;

                await Task.Delay(2000).ConfigureAwait(false);

                manager.OnNext(
                    new WorkDoneProgressReport
                    {
                        Percentage = 20,
                        Message = "loading in progress"
                    }
                );
            }
        )
        .OnInitialized(
            async (server, request, response, token) =>
            {
                workDone.OnNext(
                    new WorkDoneProgressReport
                    {
                        Percentage = 40,
                        Message = "loading almost done",
                    }
                );

                await Task.Delay(2000).ConfigureAwait(false);

                workDone.OnNext(
                    new WorkDoneProgressReport
                    {
                        Message = "loading done",
                        Percentage = 100,
                    }
                );
                workDone.OnCompleted();
            }
        )
        .OnStarted(
            async (languageServer, token) =>
            {
                using var manager = await languageServer.WorkDoneManager.Create(new WorkDoneProgressBegin { Title = "Doing some work..." })
                                                        .ConfigureAwait(false);

                manager.OnNext(new WorkDoneProgressReport { Message = "doing things..." });
                await Task.Delay(10000).ConfigureAwait(false);
                manager.OnNext(new WorkDoneProgressReport { Message = "doing things... 1234" });
                await Task.Delay(10000).ConfigureAwait(false);
                manager.OnNext(new WorkDoneProgressReport { Message = "doing things... 56789" });

                var configuration = await languageServer.Configuration.GetConfiguration(
                    new ConfigurationItem
                    {
                        Section = "typescript",
                    }, new ConfigurationItem
                    {
                        Section = "terminal",
                    }
                ).ConfigureAwait(false);

                foreach (var config in languageServer.Configuration.AsEnumerable())
                {
                    //baseConfig.Add(config.Key, config.Value);
                }

                foreach (var config in configuration.AsEnumerable())
                {
                    //scopedConfig.Add(config.Key, config.Value);
                }
                languageServer.Window.LogInfo("Hello from the server!");
            }
        )
).ConfigureAwait(false);

await server.WaitForExit.ConfigureAwait(false);

static void LaunchVSCodeAndAttach(int processId)
{
    // Path to the workspace or folder to open in VS Code
    string workspacePath = "/home/rob/code/ecschema-vscode-extension/server";

    // Command to launch VS Code
    string codeCommand = "code";

    // Arguments to open VS Code and attach to the current process
    string args = $"--folder-uri {workspacePath} --new-window --command \"workbench.action.debug.selectandstart\"";

    // Start VS Code
    Process.Start(new ProcessStartInfo
    {
        FileName = codeCommand,
        EnvironmentVariables = { { "DEBUG_PROCESS_ID", processId.ToString() } },
        Arguments = args,
        UseShellExecute = false,
        RedirectStandardOutput = true,
        RedirectStandardError = true
    });
}