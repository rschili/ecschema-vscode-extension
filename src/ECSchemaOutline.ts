import { TokenType } from "./SemanticTokens";

export interface Attribute {
    name: string;
    type: string;
    description: string;
    mandatory: boolean;
}

export interface Element {
    name: string;
    description: string;
    attributes: Attribute[];
    allowedChildren?: string[];
    allowedParents?: string[];
    tokenType: TokenType;
}

export const ecschemaOutline3_2: Record<string, Element> = {
    ECSchema: {
        name: "ECSchema",
        tokenType: TokenType.Namespace,
        description: "Root element of the ECSchema XML.",
        attributes: [
            { name: "schemaName", type: "string", description: "The name of the schema.", mandatory: true },
            { name: "alias", type: "string", description: "The alias of the schema.", mandatory: true },
            { name: "version", type: "string", description: "The version of the schema.", mandatory: true },
            { name: "description", type: "string", description: "A description of the schema.", mandatory: true },
            { name: "displayLabel", type: "string", description: "The display label of the schema.", mandatory: true },
            { name: "xmlns", type: "string", description: "The XML namespace of the schema.", mandatory: true }
        ],
        allowedChildren: ["ECSchemaReference", "ECCustomAttributes", "ECEntityClass", "ECCustomAttributeClass", "ECRelationshipClass", "ECStructClass", "ECEnumeration"]
    },
    ECSchemaReference: {
        name: "ECSchemaReference",
        tokenType: TokenType.TypeParameter,
        description: "Allows one ECSchema to refer to others.",
        attributes: [
            { name: "name", type: "string", description: "The name of the referenced schema.", mandatory: true },
            { name: "version", type: "string", description: "The version of the referenced schema.", mandatory: true },
            { name: "alias", type: "string", description: "The alias of the referenced schema.", mandatory: true }
        ],
        allowedParents: ["ECSchema"]
    },
    ECCustomAttributeClass: {
        name: "ECCustomAttributeClass",
        tokenType: TokenType.Class,
        description: "Defines a custom attribute class.",
        attributes: [
            { name: "typeName", type: "string", description: "The name of the custom attribute class.", mandatory: true },
            { name: "description", type: "string", description: "A description of the custom attribute class.", mandatory: false },
            { name: "modifier", type: "string", description: "The modifier of the custom attribute class.", mandatory: false },
            { name: "appliesTo", type: "string", description: "Specifies what the custom attribute can be applied to.", mandatory: true }
        ],
        allowedChildren: ["ECProperty"],
        allowedParents: ["ECSchema"]
    },
    ECCustomAttributes: {
        name: "ECCustomAttributes",
        tokenType: TokenType.TypeParameter,
        description: "Contains custom attributes applied to an element.",
        attributes: [],
        allowedChildren: ["*"],
        allowedParents: ["ECSchema", "ECEntityClass", "ECProperty"]
    },
    ECEnumeration: {
        name: "ECEnumeration",
        tokenType: TokenType.Enum,
        description: "Defines an enumeration.",
        attributes: [
            { name: "typeName", type: "string", description: "The name of the enumeration.", mandatory: true },
            { name: "backingTypeName", type: "string", description: "The backing type of the enumeration.", mandatory: true },
            { name: "description", type: "string", description: "A description of the enumeration.", mandatory: false },
            { name: "displayLabel", type: "string", description: "The display label of the enumeration.", mandatory: false },
            { name: "isStrict", type: "boolean", description: "Indicates if the enumeration is strict.", mandatory: false }
        ],
        allowedChildren: ["ECEnumerator"],
        allowedParents: ["ECSchema"]
    },
    ECEnumerator: {
        name: "ECEnumerator",
        tokenType: TokenType.EnumMember,
        description: "Defines an enumerator within an enumeration.",
        attributes: [
            { name: "name", type: "string", description: "The name of the enumerator.", mandatory: true },
            { name: "value", type: "string", description: "The value of the enumerator.", mandatory: true },
            { name: "displayLabel", type: "string", description: "The display label of the enumerator.", mandatory: false }
        ],
        allowedParents: ["ECEnumeration"]
    },
    ECEntityClass: {
        name: "ECEntityClass",
        tokenType: TokenType.Class,
        description: "Defines an entity class.",
        attributes: [
            { name: "typeName", type: "string", description: "The name of the entity class.", mandatory: true },
            { name: "description", type: "string", description: "A description of the entity class.", mandatory: false },
            { name: "displayLabel", type: "string", description: "The display label of the entity class.", mandatory: false },
            { name: "modifier", type: "string", description: "The modifier of the entity class.", mandatory: false }
        ],
        allowedChildren: ["BaseClass", "ECCustomAttributes", "ECProperty", "ECArrayProperty", "ECStructProperty", "ECStructArrayProperty", "ECNavigationProperty"],
        allowedParents: ["ECSchema"]
    },
    ECStructClass: {
        name: "ECStructClass",
        tokenType: TokenType.Class,
        description: "Defines a struct class.",
        attributes: [
            { name: "typeName", type: "string", description: "The name of the struct class.", mandatory: true },
            { name: "description", type: "string", description: "A description of the struct class.", mandatory: false },
            { name: "displayLabel", type: "string", description: "The display label of the struct class.", mandatory: false }
        ],
        allowedChildren: ["BaseClass", "ECCustomAttributes", "ECProperty", "ECArrayProperty", "ECStructProperty", "ECStructArrayProperty", "ECNavigationProperty"],
        allowedParents: ["ECSchema"]
    },
    BaseClass: {
        name: "BaseClass",
        tokenType: TokenType.Interface,
        description: "Specifies the base class of the entity class.",
        attributes: [],
        allowedParents: ["ECEntityClass"]
    },
    ECProperty: {
        name: "ECProperty",
        tokenType: TokenType.Property,
        description: "Defines a property within an entity class.",
        attributes: [
            { name: "propertyName", type: "string", description: "The name of the property.", mandatory: true },
            { name: "typeName", type: "string", description: "The type of the property.", mandatory: true },
            { name: "displayLabel", type: "string", description: "The display label of the property.", mandatory: false },
            { name: "description", type: "string", description: "A description of the property.", mandatory: false },
            { name: "readOnly", type: "boolean", description: "Indicates if the property is read-only.", mandatory: false }
        ],
        allowedChildren: ["ECCustomAttributes"],
        allowedParents: ["ECEntityClass", "ECCustomAttributeClass"]
    },
    ECArrayProperty: {
        name: "ECArrayProperty",
        tokenType: TokenType.Property,
        description: "Defines an array property within an entity class.",
        attributes: [
            { name: "propertyName", type: "string", description: "The name of the array property.", mandatory: true },
            { name: "typeName", type: "string", description: "The type of the array property.", mandatory: true },
            { name: "readOnly", type: "boolean", description: "Indicates if the array property is read-only.", mandatory: false },
            { name: "minOccurs", type: "number", description: "The minimum number of occurrences.", mandatory: false },
            { name: "maxOccurs", type: "string", description: "The maximum number of occurrences.", mandatory: false }
        ],
        allowedParents: ["ECEntityClass"]
    },
    ECStructProperty: {
        name: "ECStructProperty",
        tokenType: TokenType.Property,
        description: "Defines a struct property within an entity class.",
        attributes: [
            { name: "propertyName", type: "string", description: "The name of the struct property.", mandatory: true },
            { name: "typeName", type: "string", description: "The type of the struct property.", mandatory: true },
            { name: "readOnly", type: "boolean", description: "Indicates if the struct property is read-only.", mandatory: false }
        ],
        allowedParents: ["ECEntityClass"]
    },
    ECStructArrayProperty: {
        name: "ECStructArrayProperty",
        tokenType: TokenType.Property,
        description: "Defines a struct array property within an entity class.",
        attributes: [
            { name: "propertyName", type: "string", description: "The name of the struct array property.", mandatory: true },
            { name: "typeName", type: "string", description: "The type of the struct array property.", mandatory: true },
            { name: "readOnly", type: "boolean", description: "Indicates if the struct array property is read-only.", mandatory: false },
            { name: "minOccurs", type: "number", description: "The minimum number of occurrences.", mandatory: false },
            { name: "maxOccurs", type: "string", description: "The maximum number of occurrences.", mandatory: false }
        ],
        allowedParents: ["ECEntityClass"]
    },
    ECNavigationProperty: {
        name: "ECNavigationProperty",
        tokenType: TokenType.Property,
        description: "Defines a navigation property within an entity class.",
        attributes: [
            { name: "propertyName", type: "string", description: "The name of the navigation property.", mandatory: true },
            { name: "relationshipName", type: "string", description: "The name of the relationship.", mandatory: false },
            { name: "direction", type: "string", description: "The direction of the relationship.", mandatory: false },
            { name: "readOnly", type: "boolean", description: "Indicates if the navigation property is read-only.", mandatory: false }
        ],
        allowedParents: ["ECEntityClass"]
    },
    ECRelationshipClass: {
        name: "ECRelationshipClass",
        tokenType: TokenType.Class,
        description: "Defines a relationship class.",
        attributes: [
            { name: "typeName", type: "string", description: "The name of the relationship class.", mandatory: true },
            { name: "modifier", type: "string", description: "The modifier of the relationship class.", mandatory: false },
            { name: "strength", type: "string", description: "The strength of the relationship.", mandatory: false },
            { name: "strengthDirection", type: "string", description: "The direction of the relationship strength.", mandatory: false }
        ],
        allowedChildren: ["ECProperty", "Source", "Target"],
        allowedParents: ["ECSchema"]
    },
    Source: {
        name: "Source",
        tokenType: TokenType.Type,
        description: "Defines the source of the relationship.",
        attributes: [
            { name: "multiplicity", type: "string", description: "The multiplicity of the source.", mandatory: false },
            { name: "polymorphic", type: "boolean", description: "Indicates if the source is polymorphic.", mandatory: true },
            { name: "roleLabel", type: "string", description: "The role label of the source.", mandatory: false }
        ],
        allowedChildren: ["Class"],
        allowedParents: ["ECRelationshipClass"]
    },
    Target: {
        name: "Target",
        tokenType: TokenType.Type,
        description: "Defines the target of the relationship.",
        attributes: [
            { name: "multiplicity", type: "string", description: "The multiplicity of the target.", mandatory: false },
            { name: "polymorphic", type: "boolean", description: "Indicates if the target is polymorphic.", mandatory: true },
            { name: "roleLabel", type: "string", description: "The role label of the target.", mandatory: false }
        ],
        allowedChildren: ["Class"],
        allowedParents: ["ECRelationshipClass"]
    },
    Class: {
        name: "Class",
        tokenType: TokenType.Class,
        description: "Specifies the class of the source or target.",
        attributes: [
            { name: "class", type: "string", description: "The class of the source or target.", mandatory: true }
        ],
        allowedParents: ["Source", "Target"]
    },
    KindOfQuantity: {
        name: "KindOfQuantity",
        tokenType: TokenType.Type,
        description: "Defines a kind of quantity.",
        attributes: [
            { name: "typeName", type: "string", description: "The name of the kind of quantity.", mandatory: true },
            { name: "persistenceUnit", type: "string", description: "The persistence unit of the kind of quantity.", mandatory: true },
            { name: "presentationUnits", type: "string", description: "The presentation units of the kind of quantity.", mandatory: false },
            { name: "relativeError", type: "string", description: "The relative error of the kind of quantity.", mandatory: false }
        ],
        allowedParents: ["ECSchema"]
    },
    PropertyCategory: {
        name: "PropertyCategory",
        tokenType: TokenType.Type,
        description: "Defines a property category.",
        attributes: [
            { name: "typeName", type: "string", description: "The name of the property category.", mandatory: true },
            { name: "priority", type: "number", description: "The priority of the property category.", mandatory: true }
        ],
        allowedParents: ["ECSchema"]
    },
    Format: {
        name: "Format",
        tokenType: TokenType.Type,
        description: "Defines a format.",
        attributes: [
            { name: "typeName", type: "string", description: "The name of the format.", mandatory: true },
            { name: "type", type: "string", description: "The type of the format.", mandatory: false },
            { name: "precision", type: "number", description: "The precision of the format.", mandatory: false },
            { name: "roundFactor", type: "number", description: "The round factor of the format.", mandatory: false },
            { name: "minWidth", type: "number", description: "The minimum width of the format.", mandatory: false },
            { name: "showSignOption", type: "string", description: "The show sign option of the format.", mandatory: false },
            { name: "decimalSeparator", type: "string", description: "The decimal separator of the format.", mandatory: false },
            { name: "thousandSeparator", type: "string", description: "The thousand separator of the format.", mandatory: false },
            { name: "uomSeparator", type: "string", description: "The unit of measure separator of the format.", mandatory: false },
            { name: "formatTraits", type: "string", description: "The format traits of the format.", mandatory: false },
            { name: "scientificType", type: "string", description: "The scientific type of the format.", mandatory: false },
            { name: "stationOffsetSize", type: "number", description: "The station offset size of the format.", mandatory: false },
            { name: "stationSeparator", type: "string", description: "The station separator of the format.", mandatory: false }
        ],
        allowedParents: ["ECSchema"]
    },
    UnitSystem: {
        name: "UnitSystem",
        tokenType: TokenType.Type,
        description: "Defines a unit system.",
        attributes: [
            { name: "typeName", type: "string", description: "The name of the unit system.", mandatory: true },
            { name: "description", type: "string", description: "A description of the unit system.", mandatory: false },
            { name: "displayLabel", type: "string", description: "The display label of the unit system.", mandatory: false }
        ],
        allowedParents: ["ECSchema"]
    },
    Unit: {
        name: "Unit",
        tokenType: TokenType.Type,
        description: "Defines a unit.",
        attributes: [
            { name: "typeName", type: "string", description: "The name of the unit.", mandatory: true },
            { name: "phenomenon", type: "string", description: "The phenomenon of the unit.", mandatory: true },
            { name: "unitSystem", type: "string", description: "The unit system of the unit.", mandatory: true },
            { name: "definition", type: "string", description: "The definition of the unit.", mandatory: true },
            { name: "numerator", type: "number", description: "The numerator of the unit.", mandatory: false },
            { name: "denominator", type: "number", description: "The denominator of the unit.", mandatory: false },
            { name: "offset", type: "number", description: "The offset of the unit.", mandatory: false }
        ],
        allowedParents: ["ECSchema"]
    },
    InvertedUnit: {
        name: "InvertedUnit",
        tokenType: TokenType.Type,
        description: "Defines an inverted unit.",
        attributes: [
            { name: "typeName", type: "string", description: "The name of the inverted unit.", mandatory: true },
            { name: "invertsUnit", type: "string", description: "The unit that this unit inverts.", mandatory: true },
            { name: "unitSystem", type: "string", description: "The unit system of the inverted unit.", mandatory: true }
        ],
        allowedParents: ["ECSchema"]
    },
    Constant: {
        name: "Constant",
        tokenType: TokenType.Type,
        description: "Defines a constant.",
        attributes: [
            { name: "typeName", type: "string", description: "The name of the constant.", mandatory: true },
            { name: "phenomenon", type: "string", description: "The phenomenon of the constant.", mandatory: true },
            { name: "definition", type: "string", description: "The definition of the constant.", mandatory: true },
            { name: "numerator", type: "number", description: "The numerator of the constant.", mandatory: false },
            { name: "denominator", type: "number", description: "The denominator of the constant.", mandatory: false }
        ],
        allowedParents: ["ECSchema"]
    },
    Phenomenon: {
        name: "Phenomenon",
        tokenType: TokenType.Type,
        description: "Defines a phenomenon.",
        attributes: [
            { name: "typeName", type: "string", description: "The name of the phenomenon.", mandatory: true },
            { name: "definition", type: "string", description: "The definition of the phenomenon.", mandatory: true }
        ],
        allowedParents: ["ECSchema"]
    }
};