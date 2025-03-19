import * as vscode from 'vscode';
import { Node } from '@xmldom/xmldom';

/**
 * Get the vscode.Range for a given xmldom Node.
 * @param node The xmldom Node for which to calculate the range.
 * @returns A vscode.Range representing the position of the node, or undefined if the node lacks position data.
 */
export function getRangeForNode(node: Node): vscode.Range {
    if (!node || node.lineNumber === undefined || node.columnNumber === undefined || !node.localName || node.lineNumber < 1 || node.columnNumber < 1) {
        throw new Error('Invalid node to calculate range');
    }

    const start = new vscode.Position(node.lineNumber - 1, node.columnNumber);
    const end = new vscode.Position(node.lineNumber - 1, node.columnNumber + node.localName.length);
    return new vscode.Range(start, end);
}

/**
 * Get the line, character, and length for a given xmldom Node.
 * @param node The xmldom Node for which to calculate the position data.
 * @returns An object containing line, char, and length, or throws an error if the node lacks position data.
 */
export function getPositionDataForNode(node: Node): { line: number; char: number; length: number } {
    if (!node || node.lineNumber === undefined || node.columnNumber === undefined || !node.localName || node.lineNumber < 1 || node.columnNumber < 1) {
        throw new Error('Invalid node to calculate position data');
    }

    return {
        line: node.lineNumber - 1,
        char: node.columnNumber,
        length: node.localName.length,
    };
}

export function isElement(node: Node): boolean {
    return node.nodeType === 1;
}

export function isAttribute(node: Node): boolean {
    return node.nodeType === 2;
}

