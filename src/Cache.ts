import * as vscode from 'vscode';
import { XMLParser } from 'fast-xml-parser';

export class DocumentCacheEntry {
    private document: vscode.TextDocument;
    private parser: XMLParser;
    private parsedDocument: any;
    private updateTimeout: NodeJS.Timeout | null = null;
    private updatePromise: Promise<void> | null = null;
    private lastUpdateTime: number = Date.now() - 100;

    constructor(document: vscode.TextDocument, parser: XMLParser) {
        this.document = document;
        this.parser = parser;
        this.update(); // Perform an initial update immediately
    }

    public getParsedDocument(): any {
        return this.parsedDocument;
    }

    /**
     * Rate limited update. If the last update was more than 500ms ago, resolve immediately, if not, wait until at least 500ms have passed
     * before executing the update. Discard any additional calls that may happen in between
     */
    public async update(): Promise<void> {
        const now = Date.now();

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

    private async performUpdate(): Promise<void> {
        const text = this.document.getText();
        this.parsedDocument = await this.parseXML(text);
    }

    private async parseXML(xml: string): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const parsed = this.parser.parse(xml);
                resolve(parsed);
            } catch (error) {
                reject(error);
            }
        });
    }
}

export class DocumentCache {
    private cache: Map<string, DocumentCacheEntry> = new Map();
    private parser: XMLParser;

    constructor() {
        this.parser = new XMLParser();
    }

    public async getOrCreateEntry(uri: vscode.Uri, document: vscode.TextDocument): Promise<DocumentCacheEntry> {
        const uriString = uri.toString();
        let entry = this.cache.get(uriString);
        if (!entry) {
            entry = new DocumentCacheEntry(document, this.parser);
            this.cache.set(uriString, entry);
        }
        await entry.update();
        return entry;
    }

    public async getEntry(uri: vscode.Uri): Promise<DocumentCacheEntry | undefined> {
        const uriString = uri.toString();
        let entry = this.cache.get(uriString);
        return entry;
    }

    public removeDocument(uri: vscode.Uri): void {
        this.cache.delete(uri.toString());
    }
}