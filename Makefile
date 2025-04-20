# Targets
.PHONY: all build install client server clean publish test

# Default target
# Build both client and server
build:
	npm run compile

# Install dependencies for both client and server
install:
	@echo "Installing dependencies for client and server..."
	npm install
