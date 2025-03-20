using TUnit.Assertions.Extensions;

namespace ECSchemaLanguageServer.Tests;

public class MetaTests
{
    [Test]
    public async Task MetaTestAsync()
    {
        var b = true;
        await Assert.That(b).IsTrue();
    }
}