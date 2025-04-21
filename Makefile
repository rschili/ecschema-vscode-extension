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

update-license:
	@echo "Updating license headers..."
	npx generate-license-file --input package.json --output LICENSES_THIRDPARTY --overwrite
