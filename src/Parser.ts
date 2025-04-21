import { parse, DocumentCstNode} from "@xml-tools/parser";
import { buildAst, accept } from "@xml-tools/ast";
import { astPositionAtOffset } from "@xml-tools/ast-position";
import { getSuggestions } from "@xml-tools/content-assist";
import { validate } from "@xml-tools/validation";
import { checkConstraints } from "@xml-tools/constraints";

const xmlText = `<note>
                     <to>Bill</to>
                     <from>Tim</from>
                 </note>
`;

const { cst, tokenVector, lexErrors, parseErrors } = parse(xmlText);
const documentCstNode = cst as DocumentCstNode;

const xmlDocAst = buildAst(documentCstNode, tokenVector);
console.log(xmlDocAst.rootElement?.name); // -> note

const issues = validate({
    doc: xmlDocAst,
    validators: {
      element: [
        (node) => {
          if (node.name === "note") {
            const hasFrom = node.subElements.find(
              (subNode) => subNode.name === "from"
            );
            if (hasFrom === undefined) {
              return [
                {
                  msg: "A Note Element **must** have a `from` subElement",
                  node: node,
                },
              ];
            }
          }
          return [];
        },
      ],
    },
  });

// iterate issues and create diagnostics

const validationIssues = checkConstraints(documentCstNode);
// iterate issues and create diagnostics

// get suggestions based on a position
const contentAssistSuggestions = getSuggestions({
    ast: xmlDocAst,
    cst: documentCstNode,
    tokenVector: tokenVector,
    offset: 66, // Right after the '<ad` element start.
    providers: {
      // 1. There are more types(scenarios) of suggestions providers (see api.d.ts)
      // 2. Multiple providers may be supplied for a single scenario.
      elementName: [
        ({ element, prefix }: { element: any; prefix: string | undefined }) => {
          const suggestions = [];
          if (element.parent.type === "XMLElement" && element.parent.name === "note" && prefix !== undefined && "address".startsWith(prefix)) {
            suggestions.push({
              text: "address".slice(prefix.length),
              label: "address",
            });
          }
          return suggestions;
        },
      ],
    },
  });