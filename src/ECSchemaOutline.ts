interface Attribute {
    name: string;
    type: string;
    description: string;
    mandatory: boolean;
}

interface Element {
    name: string;
    description: string;
    attributes: Attribute[];
    possibleChildElements?: Element[];
}

const ecschemaOutline3_2: Element = {
    name: "ECSchema",
    description: "Root element of the ECSchema XML.",
    attributes: [
        { name: "schemaName", type: "string", description: "The name of the schema.", mandatory: true },
        { name: "alias", type: "string", description: "The alias of the schema.", mandatory: true },
        { name: "version", type: "string", description: "The version of the schema.", mandatory: true },
        { name: "description", type: "string", description: "A description of the schema.", mandatory: true },
        { name: "displayLabel", type: "string", description: "The display label of the schema.", mandatory: true },
        { name: "xmlns", type: "string", description: "The XML namespace of the schema.", mandatory: true }
    ],
    possibleChildElements: [
        {
            name: "ECSchemaReference",
            description: "Allows one ECSchema to refer to others.",
            attributes: [
                { name: "name", type: "string", description: "The name of the referenced schema.", mandatory: true },
                { name: "version", type: "string", description: "The version of the referenced schema.", mandatory: true },
                { name: "alias", type: "string", description: "The alias of the referenced schema.", mandatory: true }
            ]
        },
        {
            name: "ECCustomAttributeClass",
            description: "Defines a custom attribute class.",
            attributes: [
                { name: "typeName", type: "string", description: "The name of the custom attribute class.", mandatory: true },
                { name: "description", type: "string", description: "A description of the custom attribute class.", mandatory: false },
                { name: "modifier", type: "string", description: "The modifier of the custom attribute class.", mandatory: false },
                { name: "appliesTo", type: "string", description: "Specifies what the custom attribute can be applied to.", mandatory: true }
            ],
            possibleChildElements: [
                {
                    name: "ECProperty",
                    description: "Defines a property within a custom attribute class.",
                    attributes: [
                        { name: "propertyName", type: "string", description: "The name of the property.", mandatory: true },
                        { name: "typeName", type: "string", description: "The type of the property.", mandatory: true },
                        { name: "readOnly", type: "boolean", description: "Indicates if the property is read-only.", mandatory: false }
                    ]
                }
            ]
        },
        {
            name: "ECCustomAttributes",
            description: "Contains custom attributes applied to an element.",
            attributes: [],
            possibleChildElements: [
                {
                    name: "GeneralCustomAttribute",
                    description: "A general custom attribute.",
                    attributes: [
                        { name: "xmlns", type: "string", description: "The XML namespace of the custom attribute.", mandatory: true }
                    ],
                    possibleChildElements: [
                        {
                            name: "Primitive",
                            description: "A primitive value for the custom attribute.",
                            attributes: []
                        }
                    ]
                }
            ]
        },
        {
            name: "ECEnumeration",
            description: "Defines an enumeration.",
            attributes: [
                { name: "typeName", type: "string", description: "The name of the enumeration.", mandatory: true },
                { name: "backingTypeName", type: "string", description: "The backing type of the enumeration.", mandatory: true },
                { name: "description", type: "string", description: "A description of the enumeration.", mandatory: false },
                { name: "displayLabel", type: "string", description: "The display label of the enumeration.", mandatory: false },
                { name: "isStrict", type: "boolean", description: "Indicates if the enumeration is strict.", mandatory: false }
            ],
            possibleChildElements: [
                {
                    name: "ECEnumerator",
                    description: "Defines an enumerator within an enumeration.",
                    attributes: [
                        { name: "name", type: "string", description: "The name of the enumerator.", mandatory: true },
                        { name: "value", type: "string", description: "The value of the enumerator.", mandatory: true },
                        { name: "displayLabel", type: "string", description: "The display label of the enumerator.", mandatory: false }
                    ]
                }
            ]
        },
        {
            name: "ECEntityClass",
            description: "Defines an entity class.",
            attributes: [
                { name: "typeName", type: "string", description: "The name of the entity class.", mandatory: true },
                { name: "description", type: "string", description: "A description of the entity class.", mandatory: false },
                { name: "displayLabel", type: "string", description: "The display label of the entity class.", mandatory: false },
                { name: "modifier", type: "string", description: "The modifier of the entity class.", mandatory: false }
            ],
            possibleChildElements: [
                {
                    name: "BaseClass",
                    description: "Specifies the base class of the entity class.",
                    attributes: []
                },
                {
                    name: "ECCustomAttributes",
                    description: "Contains custom attributes applied to the entity class.",
                    attributes: [],
                    possibleChildElements: [
                        {
                            name: "ClassCustomAttribute",
                            description: "A custom attribute applied to the class.",
                            attributes: [
                                { name: "xmlns", type: "string", description: "The XML namespace of the custom attribute.", mandatory: true }
                            ],
                            possibleChildElements: [
                                {
                                    name: "Primitive",
                                    description: "A primitive value for the custom attribute.",
                                    attributes: []
                                }
                            ]
                        }
                    ]
                },
                {
                    name: "ECProperty",
                    description: "Defines a property within an entity class.",
                    attributes: [
                        { name: "propertyName", type: "string", description: "The name of the property.", mandatory: true },
                        { name: "typeName", type: "string", description: "The type of the property.", mandatory: true },
                        { name: "displayLabel", type: "string", description: "The display label of the property.", mandatory: false },
                        { name: "description", type: "string", description: "A description of the property.", mandatory: false },
                        { name: "readOnly", type: "boolean", description: "Indicates if the property is read-only.", mandatory: false }
                    ]
                },
                {
                    name: "ECArrayProperty",
                    description: "Defines an array property within an entity class.",
                    attributes: [
                        { name: "propertyName", type: "string", description: "The name of the array property.", mandatory: true },
                        { name: "typeName", type: "string", description: "The type of the array property.", mandatory: true },
                        { name: "readOnly", type: "boolean", description: "Indicates if the array property is read-only.", mandatory: false },
                        { name: "minOccurs", type: "number", description: "The minimum number of occurrences.", mandatory: false },
                        { name: "maxOccurs", type: "string", description: "The maximum number of occurrences.", mandatory: false }
                    ]
                },
                {
                    name: "ECStructProperty",
                    description: "Defines a struct property within an entity class.",
                    attributes: [
                        { name: "propertyName", type: "string", description: "The name of the struct property.", mandatory: true },
                        { name: "typeName", type: "string", description: "The type of the struct property.", mandatory: true },
                        { name: "readOnly", type: "boolean", description: "Indicates if the struct property is read-only.", mandatory: false }
                    ]
                },
                {
                    name: "ECStructArrayProperty",
                    description: "Defines a struct array property within an entity class.",
                    attributes: [
                        { name: "propertyName", type: "string", description: "The name of the struct array property.", mandatory: true },
                        { name: "typeName", type: "string", description: "The type of the struct array property.", mandatory: true },
                        { name: "readOnly", type: "boolean", description: "Indicates if the struct array property is read-only.", mandatory: false },
                        { name: "minOccurs", type: "number", description: "The minimum number of occurrences.", mandatory: false },
                        { name: "maxOccurs", type: "string", description: "The maximum number of occurrences.", mandatory: false }
                    ]
                },
                {
                    name: "ECNavigationProperty",
                    description: "Defines a navigation property within an entity class.",
                    attributes: [
                        { name: "propertyName", type: "string", description: "The name of the navigation property.", mandatory: true },
                        { name: "relationshipName", type: "string", description: "The name of the relationship.", mandatory: false },
                        { name: "direction", type: "string", description: "The direction of the relationship.", mandatory: false },
                        { name: "readOnly", type: "boolean", description: "Indicates if the navigation property is read-only.", mandatory: false }
                    ]
                }
            ]
        },
        {
            name: "ECRelationshipClass",
            description: "Defines a relationship class.",
            attributes: [
                { name: "typeName", type: "string", description: "The name of the relationship class.", mandatory: true },
                { name: "modifier", type: "string", description: "The modifier of the relationship class.", mandatory: false },
                { name: "strength", type: "string", description: "The strength of the relationship.", mandatory: false },
                { name: "strengthDirection", type: "string", description: "The direction of the relationship strength.", mandatory: false }
            ],
            possibleChildElements: [
                {
                    name: "ECProperty",
                    description: "Defines a property within a relationship class.",
                    attributes: [
                        { name: "propertyName", type: "string", description: "The name of the property.", mandatory: true },
                        { name: "typeName", type: "string", description: "The type of the property.", mandatory: true },
                        { name: "readOnly", type: "boolean", description: "Indicates if the property is read-only.", mandatory: false }
                    ]
                },
                {
                    name: "Source",
                    description: "Defines the source of the relationship.",
                    attributes: [
                        { name: "multiplicity", type: "string", description: "The multiplicity of the source.", mandatory: false },
                        { name: "polymorphic", type: "boolean", description: "Indicates if the source is polymorphic.", mandatory: true },
                        { name: "roleLabel", type: "string", description: "The role label of the source.", mandatory: false }
                    ],
                    possibleChildElements: [
                        {
                            name: "Class",
                            description: "Specifies the class of the source.",
                            attributes: [
                                { name: "class", type: "string", description: "The class of the source.", mandatory: true }
                            ]
                        }
                    ]
                },
                {
                    name: "Target",
                    description: "Defines the target of the relationship.",
                    attributes: [
                        { name: "multiplicity", type: "string", description: "The multiplicity of the target.", mandatory: false },
                        { name: "polymorphic", type: "boolean", description: "Indicates if the target is polymorphic.", mandatory: true },
                        { name: "roleLabel", type: "string", description: "The role label of the target.", mandatory: false }
                    ],
                    possibleChildElements: [
                        {
                            name: "Class",
                            description: "Specifies the class of the target.",
                            attributes: [
                                { name: "class", type: "string", description: "The class of the target.", mandatory: true }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};

export { ecschemaOutline3_2 as ecschemaStructure, Attribute, Element };