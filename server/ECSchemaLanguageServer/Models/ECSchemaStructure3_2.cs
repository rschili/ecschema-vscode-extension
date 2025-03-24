using System;
using System.Collections.Generic;

namespace ECSchemaLanguageServer.Models
{
    public enum TokenType
    {
        Namespace,
        TypeParameter,
        Class,
        Enum,
        EnumMember,
        Interface,
        Property,
        Type
    }

    public class Attribute
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public string Description { get; set; }
        public bool Mandatory { get; set; }
    }

    public class Element
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public List<Attribute> Attributes { get; set; }
        public List<string> AllowedChildren { get; set; }
        public List<string> AllowedParents { get; set; }
        public TokenType TokenType { get; set; }
    }

    public static class ECSchemaOutline
    {
        public static readonly Dictionary<string, Element> ECSchemaOutline3_2 = new Dictionary<string, Element>
        {
            {
                "ECSchema", new Element
                {
                    Name = "ECSchema",
                    TokenType = TokenType.Namespace,
                    Description = "Root element of the ECSchema XML.",
                    Attributes = new List<Attribute>
                    {
                        new Attribute { Name = "schemaName", Type = "string", Description = "The name of the schema.", Mandatory = true },
                        new Attribute { Name = "alias", Type = "string", Description = "The alias of the schema.", Mandatory = true },
                        new Attribute { Name = "version", Type = "string", Description = "The version of the schema.", Mandatory = true },
                        new Attribute { Name = "description", Type = "string", Description = "A description of the schema.", Mandatory = true },
                        new Attribute { Name = "displayLabel", Type = "string", Description = "The display label of the schema.", Mandatory = true },
                        new Attribute { Name = "xmlns", Type = "string", Description = "The XML namespace of the schema.", Mandatory = true }
                    },
                    AllowedChildren = new List<string>
                    {
                        "ECSchemaReference", "ECCustomAttributes", "ECEntityClass", "ECCustomAttributeClass",
                        "ECRelationshipClass", "ECStructClass", "ECEnumeration"
                    }
                }
            },
            {
                "ECSchemaReference", new Element
                {
                    Name = "ECSchemaReference",
                    TokenType = TokenType.TypeParameter,
                    Description = "Allows one ECSchema to refer to others.",
                    Attributes = new List<Attribute>
                    {
                        new Attribute { Name = "name", Type = "string", Description = "The name of the referenced schema.", Mandatory = true },
                        new Attribute { Name = "version", Type = "string", Description = "The version of the referenced schema.", Mandatory = true },
                        new Attribute { Name = "alias", Type = "string", Description = "The alias of the referenced schema.", Mandatory = true }
                    },
                    AllowedParents = new List<string> { "ECSchema" }
                }
            },
            {
                "ECCustomAttributeClass", new Element
                {
                    Name = "ECCustomAttributeClass",
                    TokenType = TokenType.Class,
                    Description = "Defines a custom attribute class.",
                    Attributes = new List<Attribute>
                    {
                        new Attribute { Name = "typeName", Type = "string", Description = "The name of the custom attribute class.", Mandatory = true },
                        new Attribute { Name = "description", Type = "string", Description = "A description of the custom attribute class.", Mandatory = false },
                        new Attribute { Name = "modifier", Type = "string", Description = "The modifier of the custom attribute class.", Mandatory = false },
                        new Attribute { Name = "appliesTo", Type = "string", Description = "Specifies what the custom attribute can be applied to.", Mandatory = true }
                    },
                    AllowedChildren = new List<string> { "ECProperty" },
                    AllowedParents = new List<string> { "ECSchema" }
                }
            },
            {
                "ECCustomAttributes", new Element
                {
                    Name = "ECCustomAttributes",
                    TokenType = TokenType.TypeParameter,
                    Description = "Contains custom attributes applied to an element.",
                    Attributes = new List<Attribute>(),
                    AllowedChildren = new List<string> { "*" },
                    AllowedParents = new List<string> { "ECSchema", "ECEntityClass", "ECProperty" }
                }
            },
            {
                "ECEnumeration", new Element
                {
                    Name = "ECEnumeration",
                    TokenType = TokenType.Enum,
                    Description = "Defines an enumeration.",
                    Attributes = new List<Attribute>
                    {
                        new Attribute { Name = "typeName", Type = "string", Description = "The name of the enumeration.", Mandatory = true },
                        new Attribute { Name = "backingTypeName", Type = "string", Description = "The backing type of the enumeration.", Mandatory = true },
                        new Attribute { Name = "description", Type = "string", Description = "A description of the enumeration.", Mandatory = false },
                        new Attribute { Name = "displayLabel", Type = "string", Description = "The display label of the enumeration.", Mandatory = false },
                        new Attribute { Name = "isStrict", Type = "boolean", Description = "Indicates if the enumeration is strict.", Mandatory = false }
                    },
                    AllowedChildren = new List<string> { "ECEnumerator" },
                    AllowedParents = new List<string> { "ECSchema" }
                }
            }
            // Add other elements here following the same structure
        };
    }
}