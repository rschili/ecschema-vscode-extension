import * as vscode from 'vscode';
import { Document, DOMParser, Node } from '@xmldom/xmldom';

/**
 * Xmldom is a slow parser, but we need to keep track of the position of each node in the document.
 * This seems like the only parser that reliably does it.
 * We rate limit the updates to the cache to avoid using too much CPU.
 */
export class DocumentCacheEntry {
    private document: vscode.TextDocument;
    private parsedDocument: Document | null = null;
    private updateTimeout: NodeJS.Timeout | null = null;
    private updatePromise: Promise<void> | null = null;
    private lastUpdateTime: number = Date.now() - 100;
    private isDirty: boolean = true; // Indicates whether the cache is up-to-date
    private parser: DOMParser = new DOMParser({ locator: true });

    private outputChannel: vscode.OutputChannel;

    constructor(document: vscode.TextDocument, outputChannel: vscode.OutputChannel) {
        this.document = document;
        this.outputChannel = outputChannel;
    }

    public getParsedDocument(): Document | null {
        return this.isDirty ? null : this.parsedDocument;
    }

    public async update(): Promise<void> {
        const now = Date.now();

        // Mark as dirty while the update is pending
        this.isDirty = true;

        // If this is the first call or 500ms have passed since the last update, resolve immediately
        if (!this.lastUpdateTime || now - this.lastUpdateTime >= 500) {
            this.lastUpdateTime = now;
            return this.performUpdate();
        }

        // Otherwise, debounce the update
        if (this.updatePromise) {
            return this.updatePromise;
        }

        this.updatePromise = new Promise<void>((resolve) => {
            if (this.updateTimeout) {
                clearTimeout(this.updateTimeout);
            }

            this.updateTimeout = setTimeout(async () => {
                try {
                    await this.performUpdate();
                } finally {
                    this.updatePromise = null;
                    resolve();
                }
            }, 500 - (now - this.lastUpdateTime)); // Adjust delay based on elapsed time
        });

        return this.updatePromise;
    }

    public getNodePosition(node: any): { line: number; column: number } | undefined {
        if (this.isDirty) {
            return undefined; // Return undefined if the cache is dirty
        }
    
        if (node && node.lineNumber && node.columnNumber) {
            return { line: node.lineNumber, column: node.columnNumber };
        }
        return undefined;
    }

    public findNodeByPosition(document: Document, line: number, column: number): Node | undefined {
        if (this.isDirty) {
            return undefined; // Return undefined if the cache is dirty
        }
    
        function traverse(node: Node): Node | undefined {
            if ((node as any).lineNumber === line && (node as any).columnNumber === column) {
                return node;
            }
    
            for (let i = 0; i < node.childNodes.length; i++) {
                const result = traverse(node.childNodes[i]);
                if (result) {
                    return result;
                }
            }
    
            return undefined;
        }
    
        return traverse(document);
    }

    private async performUpdate(): Promise<void> {
        const startTime = Date.now();
        this.outputChannel.appendLine(`Starting cache update for ${this.document.uri.toString()}`);
        
        // Perform the parsing
        const text = this.document.getText();
        this.parsedDocument = this.parser.parseFromString(text, 'application/xml');
        
        const endTime = Date.now();
        this.isDirty = false; // Mark as clean after the update is complete
        this.outputChannel.appendLine(`Cache update completed for ${this.document.uri.toString()} in ${endTime - startTime}ms`);
    }
}

export class DocumentCache {
    private cache: Map<string, DocumentCacheEntry> = new Map();
    private outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
    }

    public async getOrCreateEntry(uri: vscode.Uri, document: vscode.TextDocument): Promise<DocumentCacheEntry> {
        const uriString = uri.toString();
        let entry = this.cache.get(uriString);
        if (!entry) {
            entry = new DocumentCacheEntry(document, this.outputChannel);
            this.cache.set(uriString, entry);
        }
        await entry.update();
        return entry;
    }

    public async getEntry(uri: vscode.Uri): Promise<DocumentCacheEntry | undefined> {
        return this.cache.get(uri.toString());
    }

    public removeDocument(uri: vscode.Uri): void {
        this.cache.delete(uri.toString());
    }
}