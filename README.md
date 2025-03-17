# ecschema-vscode-extension

This is supposed to provide additional support for composing and editing ecschema xml files in vscode.

Planned features:
- [ ] Provide hover descriptions for all known elements and attributes, possibly for items referenced from external files
- [ ] Report errors for missing mandatory attributes
- [ ] Highlight unknown elements and attributes
- [ ] Provide auto completion based on the current node
- [ ] Validate attribute values (item names, references, types...)
- [ ] Provide code actions that allow to auto complete or fix the current element
- [ ] Detect duplicate attributes or item/property names

Registers the following providers to vscode
- SemanticTokenProvider (complements the visual studio textmate regex grammar for xml to add more context)
- HoverProvider (tooltips with descriptions or additional into)
- CodeActionsProvider (fix broken or missing attributes)
- Diagnostic (report errors about broken things)
- CompletionItemProvider (suggest attributes, item names, elements)