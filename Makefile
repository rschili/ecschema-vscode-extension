# Targets
.PHONY: all build install client server clean publish

# Default target
# Build both client and server
build: client server

# Install dependencies for both client and server
install:
	@echo "Installing dependencies for client and server..."
	cd client && npm install
	cd server && dotnet restore

# Build the Node.js client package
client:
	@echo "Building Node.js client package..."
	npm run compile

# Build the .NET server package
server:
	@echo "Building .NET server package..."
	cd server && dotnet build

# Publish the .NET server package for multiple platforms
publish:
	@echo "Publishing .NET server package for Windows, Linux, and macOS..."
	cd server && dotnet publish -r win-x64 -c Release
	cd server && dotnet publish -r linux-x64 -c Release
	cd server && dotnet publish -r osx-x64 -c Release

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	cd client && npm run clean || true
	cd server && dotnet clean