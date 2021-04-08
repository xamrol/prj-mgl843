"use strict";
exports.__esModule = true;
var ts_morph_1 = require("ts-morph");
var id = 1;
var parentClassId;
var computedId;
var stringParameterFound = false;
var classesModifiersTab = new Array();
var primitiveTypesTab = new Array();
var otherTypesTab = new Array();
var namespacesTab = new Array();
var typesDictionary = {};
var entitiesIds = {};
var namespacesDictionary = {};
var accessesDictionary = {};
// Debug
var classMembers;
var accessors;
var attributeModifiers = new Array();
var project = new ts_morph_1.Project();
//const famixPrefix = "Famix-Java-Entities";
var famixPrefix = "FAMIX";
var mseFile = '(\n';
var usableString = '';
project.addSourceFilesAtPaths("entities/**/*.ts");
project.getSourceFiles().forEach(function (sourceFile) {
    console.log('\nSource file: ' + sourceFile.getBaseName());
    var hasClasses = sourceFile.getClasses().length > 0;
    var hasInterfaces = sourceFile.getInterfaces().length > 0;
    if (hasClasses) {
        // Initial computation
        computedId = sourceFile.getClasses().length + 1;
        sourceFile.getClasses().forEach(function (cl) {
            cl.getConstructors().forEach(function (co) {
                computedId += co.getParameters().length + 1;
                co.getParameters().forEach(function (pa) {
                    var tmpParamType = pa.getType().getText();
                    locateTypeToCategory(convertTStypeToJava(tmpParamType));
                });
            });
            accessors = cl.getMethods()[0];
            //console.log('Class '+cl.getName()+': NbMethods='+cl.getMethods().length+', NbMembers='+cl.getMembers().length);
            computedId += cl.getMethods().length + cl.getMembers().length;
            //computedId += cl.getMethods().length + 1;
            cl.getMethods().forEach(function (me) {
                locateTypeToCategory(convertTStypeToJava(me.getReturnType().getText()));
                if (me.getParameters().length > 0) {
                    me.getParameters().forEach(function (pa) {
                        locateTypeToCategory(convertTStypeToJava(pa.getType().getText()));
                    });
                    computedId += me.getParameters().length;
                }
            });
            // Checking the namespaces
            var namespaceDefinition;
            if (cl.getParentNamespace() == undefined) {
                namespaceDefinition = "<Default Package>";
            }
            else {
                namespaceDefinition = cl.getParentNamespace().getText();
            }
            if (!namespacesTab.includes(namespaceDefinition)) {
                namespacesTab.push(namespaceDefinition);
            }
        });
        computedId += primitiveTypesTab.length + otherTypesTab.length;
        // Filling up the types dictionary
        var tmpComputedId = computedId;
        primitiveTypesTab.forEach(function (pt) {
            typesDictionary[pt] = tmpComputedId++;
        });
        otherTypesTab.forEach(function (ot) {
            typesDictionary[ot] = tmpComputedId++;
        });
        // Filling up the namespaces dictionary
        namespacesTab.forEach(function (na) {
            namespacesDictionary[na] = tmpComputedId++;
        });
        computedId = tmpComputedId + 1;
        console.log('Found classes:');
        sourceFile.getClasses().forEach(function (oneClass) {
            console.log('Class ' + oneClass.getName());
            console.log(' Nb Modifiers :' + oneClass.getModifiers().length);
            if (oneClass.getConstructors().length > 0) {
                console.log(' Constructor :');
                oneClass.getConstructors().forEach(function (construct) {
                    var nbParameters = construct.getParameters().length;
                    var paramOutput = '  Number Of Parameters: ' + nbParameters.toString();
                    if (nbParameters > 0) {
                        construct.getParameters().forEach(function (cons) {
                            paramOutput += '\n   Parameter : name: ' + cons.getName() + ', type: ' + cons.getType().getText();
                            if (cons.getType().getText() == 'string') {
                                stringParameterFound = true;
                            }
                        });
                    }
                    console.log(paramOutput);
                });
            }
            //addClassToMSE(oneClass, mseFile);
            //addMethodToMSE(oneClass, parentClassId, mseFile);
        });
    }
    if (hasInterfaces) {
        console.log('Found interfaces:');
        sourceFile.getInterfaces().forEach(function (inter) {
            console.log(' Interface: ' + inter.getName());
        });
    }
    // Debug
    //console.log('\ncomputedId: ' + computedId + ', id: ' + id);
});
// Adding String class
//if(stringParameterFound) {
//    addClassStringToMSE(mseFile);
//}
/*
    For this part, we use custom codes to add each entity to the mseFile stream
    Find below the configuration
    1 --> Classes
    2 --> Methods
    3 --> Methods' Parameters
    4 --> Classes' attributes
*/
initGoingThroughProject(project, 1); // Adding Classes informations
initGoingThroughProject(project, 2); // Adding Methods informations
initGoingThroughProject(project, 3); // Adding Parameters informations
initGoingThroughProject(project, 4); // Adding classses' attributes informations
/*
    Adding the different entities the mseFile variable
    - the different types (PrimitiveType & Class)
    - the namespaces (Namespace)
*/
addTypesToMSE();
addNamespacesToMSE();
initGoingThroughProject(project, 5); // Adding Implicit variables
initGoingThroughProject(project, 6); // Adding file anchors
initGoingThroughProject(project, 7); // Adding inheritance
mseFile += ')';
// Debug
console.log('\n\nMSEFile:\n' + mseFile);
//console.log(typesDictionary);
//console.log(primitiveTypesTab);
console.log(otherTypesTab);
console.log(entitiesIds);
console.log(classMembers);
console.log('\ncomputedId: ' + computedId + ', id: ' + id);
console.log('otherTypesTab.length: ' + otherTypesTab.length);
// Saving mseFile string inside a MSE file
saveMSEFile(mseFile);
console.log(accessors);
console.log(attributeModifiers);
/*
    Useful functions for the whole process
*/
function initGoingThroughProject(project, process) {
    project.getSourceFiles().forEach(function (srcFile) {
        if (srcFile.getClasses().length > 0) {
            srcFile.getClasses().forEach(function (aClass) {
                switch (process) {
                    case 1: // Adding classes informations
                        addClassToMSE(aClass, mseFile);
                        break;
                    case 2: // Adding methods informations
                        addMethodToMSE(aClass, entitiesIds['Class-' + aClass.getName()], mseFile);
                        break;
                    case 3: // Adding methods' parameters informations
                        addMethodsParametersToMSE(aClass);
                        break;
                    case 4: // Adding classes' attributes
                        addClassesAttributesToMSE(aClass);
                        break;
                    case 5: // Adding implicit variables
                        addImplicitVariablesToMSE(aClass);
                        break;
                    case 6: // Adding file anchors
                        addIndexedFileAnchors(aClass);
                        break;
                    case 7: // Adding inheritance
                        addInheritance(aClass);
                        break;
                    default:
                        console.log("Error<initGoingThroughProject>: Unknown process code");
                }
            });
        }
    });
}
function addClassToMSE(clazz, mseDocument) {
    var tmpId = id;
    parentClassId = id;
    var containerRef = getEntityContainerRef(clazz);
    entitiesIds["Class-" + clazz.getName()] = id;
    mseFile += "    (" + famixPrefix + ".Class (id: " + id++ + ")\n";
    mseFile += "        (name '" + clazz.getName() + "')\n";
    mseFile += "        (modifiers 'public')";
    mseFile += "\n        (typeContainer (ref: " + containerRef + "))";
    // Does TypeContainer (from Java) make sense in TypeScript?
    // Checking the modifiers
    /*
    let nbModifiers:number = clazz.getModifiers().length;
    if(nbModifiers > 0) {
        classesModifiersTab[tmpId] = new Array();
        let tmpTab = new Array();
        clazz.getModifiers().forEach(mod => {
            tmpTab.push(mod.getType().getText());
        });
        classesModifiersTab.push(tmpTab);

        mseFile += "\n        (modifiers";
        classesModifiersTab[tmpId].array.forEach(element => {
            mseFile += " '" + element + "'";
        });

        mseFile += ")";
    }
    */
    mseFile += ")\n";
}
function addOtherTypesClassToMSE(typeName, typeId) {
    entitiesIds["OtherType-" + typeName] = typeId;
    mseFile += "    (" + famixPrefix + ".Class (id: " + typeId + ")\n";
    mseFile += "        (name '" + typeName + "')\n";
    mseFile += "		(isStub true)\n";
    mseFile += "		(modifiers 'public' 'final')";
    mseFile += ")\n";
}
function addMethodToMSE(clazz, parentId, mseDocument) {
    if (clazz.getMethods().length > 0) {
        clazz.getMethods().forEach(function (meth) {
            attributeModifiers.push(meth.getBodyText());
            var tmpReturnType = convertTStypeToJava(meth.getReturnType().getText());
            entitiesIds["Method-" + meth.getName()] = id;
            mseFile += "    (" + famixPrefix + ".Method (id: " + id++ + ")\n";
            mseFile += "        (name '" + meth.getName() + "')\n";
            mseFile += "		(cyclomaticComplexity 1)\n";
            mseFile += "		(declaredType (ref: " + typesDictionary[tmpReturnType] + "))\n";
            // Checking the modifiers
            //checkAnEntityModifier(meth, mseFile);
            var nbModifiers = meth.getModifiers().length;
            if (nbModifiers > 0) {
                var tmpTab_1 = new Array();
                meth.getModifiers().forEach(function (mod) {
                    tmpTab_1.push(mod.getText());
                });
                mseFile += "        (modifiers";
                tmpTab_1.forEach(function (element) {
                    mseFile += " '" + element + "'";
                });
                mseFile += ")\n";
            }
            mseFile += "		(numberOfStatements " + meth.getStatements().length + ")\n";
            mseFile += "		(parentType (ref: " + parentId + "))\n";
            // Including the return type
            /*
            var methReturnType:string = convertTStypeToJava(meth.getReturnType().getText());
            if(methReturnType.length>0) {
                methReturnType += " ";
            }
            let tmpString: string = "		(signature '" + methReturnType + meth.getName() + "(";
            */
            // Not including the return type
            var tmpString = "		(signature '" + meth.getName() + "(";
            if (meth.getParameters().length > 0) {
                var tmpIncrement_1 = 1;
                meth.getParameters().forEach(function (ele) {
                    if (++tmpIncrement_1 <= meth.getParameters().length) {
                        tmpString += ', ';
                    }
                    //var eleType:string = ele.getType().getText();
                    tmpString += convertTStypeToJava(ele.getType().getText());
                });
            }
            tmpString += ')';
            //mseFile += "		(signature '" + meth.getSignature().getParameters() + "()" + "')";
            mseFile += tmpString + "')";
            mseFile += ")\n";
        });
    }
}
function addMethodsParametersToMSE(clazz) {
    if (clazz.getMethods().length > 0) {
        clazz.getMethods().forEach(function (me) {
            if (me.getParameters().length > 0) {
                var methodId_1 = entitiesIds["Method-" + me.getName()];
                me.getParameters().forEach(function (pa) {
                    var tmpReturnType = convertTStypeToJava(pa.getType().getText());
                    entitiesIds["Parameter-" + pa.getName()] = id;
                    mseFile += "    (" + famixPrefix + ".Parameter (id: " + id++ + ")\n";
                    mseFile += "		(name '" + pa.getName() + "')\n";
                    mseFile += "		(declaredType (ref: " + typesDictionary[tmpReturnType] + "))\n";
                    mseFile += "		(parentBehaviouralEntity (ref: " + methodId_1 + ")))\n";
                });
            }
        });
    }
}
function addClassesAttributesToMSE(clazz) {
    //classMembers = clazz.getInstanceMembers()[0].getNodeProperty;
    // classMembers = clazz.getMembers()[0].getText();
    //var str1 = clazz.getMembers()[0].getText();
    //var pos1 = str1.indexOf(' :');
    //var str2 = str1.substring(0,pos1);
    //classMembers = str2+'-';
    //classMembers = '-' + clazz.getMembers()[0].getType().getText() + '-';
    var tmpReturnType;
    clazz.getMembers().forEach(function (mem) {
        tmpReturnType = convertTStypeToJava(mem.getType().getText());
        var classId = entitiesIds["Class-" + clazz.getName()];
        if (tmpReturnType != 'Unknown') {
            var str1 = mem.getText();
            var pos1 = str1.indexOf(':');
            var str2 = str1.substring(0, pos1).trim();
            //const memName = str2.toLowerCase();
            var memName = str2;
            entitiesIds["Attribute-" + memName] = id;
            mseFile += "    (" + famixPrefix + ".Attribute (id: " + id++ + ")\n";
            mseFile += "		(name '" + memName + "')\n";
            mseFile += "		(declaredType (ref: " + typesDictionary[tmpReturnType] + "))\n";
            //checkAnEntityModifier(mem, mseFile);
            // Checking the modifiers
            var nbModifiers = mem.getModifiers().length;
            if (nbModifiers > 0) {
                var aTab = new Array();
                mem.getModifiers().forEach(function (mod) {
                    aTab.push(mod.getText());
                });
                mseFile += "        (modifiers";
                aTab.forEach(function (element) {
                    mseFile += " '" + element + "'";
                });
                mseFile += ")\n";
            }
            else {
                mseFile += "        (modifiers 'private')\n";
            }
            mseFile += "		(parentType (ref: " + classId + ")))\n";
        }
    });
}
function addTypesToMSE() {
    // Handling the primitive types first
    primitiveTypesTab.forEach(function (pt) {
        entitiesIds["PrimitiveType-" + pt] = typesDictionary[pt];
        mseFile += "    (" + famixPrefix + ".PrimitiveType (id: " + typesDictionary[pt] + ")\n";
        mseFile += "		(name '" + pt + "')\n";
        mseFile += "		(isStub true))\n";
    });
    // Handling then the other types
    otherTypesTab.forEach(function (ot) {
        addOtherTypesClassToMSE(ot, typesDictionary[ot]);
    });
}
function addImplicitVariablesToMSE(clazz) {
    if (clazz.getMethods().length > 0) {
        clazz.getMethods().forEach(function (meth) {
            var tmpReturnType = convertTStypeToJava(meth.getReturnType().getText());
            var dictKey = 'Method-' + meth.getName();
            var dictKey1 = "ImplicitVariable-" + meth.getName();
            if (tmpReturnType == 'void') {
                // Adding implicit variable
                entitiesIds[dictKey1] = id;
                mseFile += "    (" + famixPrefix + ".ImplicitVariable (id: " + id++ + ")\n";
                mseFile += "		(name 'self')\n";
                mseFile += "		(isStub true)\n";
                mseFile += "		(parentBehaviouralEntity (ref: " + entitiesIds[dictKey] + ")))\n";
                // Adding self access
                entitiesIds["Access-Self-" + meth.getName()] = id;
                accessesDictionary['Self-' + meth.getName()] = meth.getName();
                mseFile += "    (" + famixPrefix + ".Access (id: " + id++ + ")\n";
                mseFile += "		(accessor (ref: " + entitiesIds[dictKey] + "))\n";
                mseFile += "		(isWrite true)\n";
                mseFile += "		(variable (ref: " + entitiesIds[dictKey1] + ")))\n";
                // Adding parameters' access
                if (meth.getParameters().length > 0) {
                    meth.getParameters().forEach(function (ele) {
                        var aValue = id + 1;
                        entitiesIds["Access-Param-" + ele.getName()] = id;
                        accessesDictionary['Parameter-' + ele.getName()] = meth.getName();
                        mseFile += "    (" + famixPrefix + ".Access (id: " + id++ + ")\n";
                        mseFile += "		(accessor (ref: " + entitiesIds[dictKey] + "))\n";
                        mseFile += "		(previous (ref: " + aValue + "))\n";
                        mseFile += "		(variable (ref: " + entitiesIds["Parameter-" + ele.getName()] + ")))\n";
                        // Adding attributes' access
                        var modifiedAttribute = retrieveModifiedAttribute(meth.getBodyText(), ele.getName());
                        if (modifiedAttribute != '') {
                            entitiesIds["Access-Attribute-" + modifiedAttribute] = id;
                            accessesDictionary['Attribute-' + ele.getName()] = meth.getName();
                            mseFile += "    (" + famixPrefix + ".Access (id: " + id++ + ")\n";
                            mseFile += "		(accessor (ref: " + entitiesIds[dictKey] + "))\n";
                            mseFile += "		(isWrite true)\n";
                            mseFile += "		(previous (ref: " + entitiesIds["Access-Self-" + meth.getName()] + "))\n";
                            mseFile += "		(variable (ref: " + entitiesIds["Attribute-" + modifiedAttribute] + ")))\n";
                        }
                    });
                }
            }
        });
    }
}
function addIndexedFileAnchors(clazz) {
    var lStart = 0;
    var lEnd = 0;
    // Handing classes
    lStart = clazz.getPos() + 1;
    lEnd = clazz.getEnd() + 1;
    mseFile += "    (" + famixPrefix + ".IndexedFileAnchor (id: " + id++ + ")\n";
    mseFile += "		(element (ref: " + entitiesIds['Class-' + clazz.getName()] + "))\n";
    mseFile += "		(endPos " + lEnd + ")\n";
    mseFile += "		(fileName '" + clazz.getName() + ".java')\n";
    mseFile += "		(startPos " + lStart + "))\n";
    // Handling classes' properties
    if (clazz.getProperties().length > 0) {
        clazz.getProperties().forEach(function (me) {
            lStart = me.getPos() + 1;
            lEnd = me.getEnd() + 1;
            var lEntityKey = getPropertyWithoutType(me.getText());
            mseFile += "    (" + famixPrefix + ".IndexedFileAnchor (id: " + id++ + ")\n";
            mseFile += "		(element (ref: " + entitiesIds['Attribute-' + lEntityKey] + "))\n";
            mseFile += "		(endPos " + lEnd + ")\n";
            mseFile += "		(fileName '" + clazz.getName() + ".java')\n";
            mseFile += "		(startPos " + lStart + "))\n";
        });
    }
    // Handling methods
    if (clazz.getMethods().length > 0) {
        clazz.getMethods().forEach(function (me) {
            lStart = me.getPos() + 1;
            lEnd = me.getEnd() + 1;
            var lEntityKey = me.getName();
            mseFile += "    (" + famixPrefix + ".IndexedFileAnchor (id: " + id++ + ")\n";
            mseFile += "		(element (ref: " + entitiesIds['Method-' + lEntityKey] + "))\n";
            mseFile += "		(endPos " + lEnd + ")\n";
            mseFile += "		(fileName '" + clazz.getName() + ".java')\n";
            mseFile += "		(startPos " + lStart + "))\n";
            // Adding the IFA access
            if (accessesDictionary['Self-' + me.getName()] == me.getName()) {
                mseFile += "    (" + famixPrefix + ".IndexedFileAnchor (id: " + id++ + ")\n";
                mseFile += "		(element (ref: " + entitiesIds['Access-Self-' + lEntityKey] + "))\n";
                mseFile += "		(endPos " + lEnd + ")\n";
                mseFile += "		(fileName '" + clazz.getName() + ".java')\n";
                mseFile += "		(startPos " + lStart + "))\n";
            }
            // Adding the parameters
            if (me.getParameters().length > 0) {
                me.getParameters().forEach(function (pa) {
                    lStart = pa.getPos() + 1;
                    lEnd = pa.getEnd() + 1;
                    var lEntityKey = pa.getName();
                    mseFile += "    (" + famixPrefix + ".IndexedFileAnchor (id: " + id++ + ")\n";
                    mseFile += "		(element (ref: " + entitiesIds['Parameter-' + lEntityKey] + "))\n";
                    mseFile += "		(endPos " + lEnd + ")\n";
                    mseFile += "		(fileName '" + clazz.getName() + ".java')\n";
                    mseFile += "		(startPos " + lStart + "))\n";
                    // Adding the IFA access
                    if (accessesDictionary['Parameter-' + pa.getName()] == me.getName()) {
                        lStart = pa.getPos() + 1;
                        lEnd = pa.getEnd() + 1;
                        var lEntityKey_1 = pa.getName();
                        mseFile += "    (" + famixPrefix + ".IndexedFileAnchor (id: " + id++ + ")\n";
                        mseFile += "		(element (ref: " + entitiesIds['Access-Param-' + lEntityKey_1] + "))\n";
                        mseFile += "		(endPos " + lEnd + ")\n";
                        mseFile += "		(fileName '" + clazz.getName() + ".java')\n";
                        mseFile += "		(startPos " + lStart + "))\n";
                        // Adding the IFA access
                        var modifiedAttribute = retrieveModifiedAttribute(me.getBodyText(), pa.getName());
                        if (modifiedAttribute != '') {
                            if (accessesDictionary['Attribute-' + pa.getName()] == me.getName()) {
                                mseFile += "    (" + famixPrefix + ".IndexedFileAnchor (id: " + id++ + ")\n";
                                mseFile += "		(element (ref: " + entitiesIds['Access-Attribute-' + modifiedAttribute] + "))\n";
                                mseFile += "		(endPos " + lEnd + ")\n";
                                mseFile += "		(fileName '" + clazz.getName() + ".java')\n";
                                mseFile += "		(startPos " + lStart + "))\n";
                            }
                        }
                    }
                });
            }
        });
    }
}
function addInheritance(clazz) {
    if (clazz.getExtends() != undefined) {
        mseFile += "    (" + famixPrefix + ".Inheritance (id: " + id++ + ")\n";
        mseFile += "		(subclass (ref: " + entitiesIds['Class-' + clazz.getName()] + "))\n";
        mseFile += "		(superclass (ref: " + entitiesIds['Class-' + clazz.getExtends().getText()] + ")))\n";
    }
}
function addNamespacesToMSE() {
    var lCount = 0;
    namespacesTab.forEach(function (na) {
        entitiesIds["Namespace-" + na] = namespacesDictionary[na];
        mseFile += "    (" + famixPrefix + ".Namespace (id: " + namespacesDictionary[na] + ")\n";
        mseFile += "		(name '" + na + "'))\n";
        if (lCount < namespacesDictionary[na]) {
            lCount = namespacesDictionary[na];
        }
    });
    id = lCount + 1;
}
function getEntityContainerRef(clazz) {
    var namespaceDefinition;
    if (clazz.getParentNamespace() == undefined) {
        namespaceDefinition = "<Default Package>";
    }
    return namespacesDictionary[namespaceDefinition];
}
function saveMSEFile(mseFile) {
    var fs = require('fs');
    fs.writeFileSync('FAMIXModel.mse', mseFile);
    console.log('\nFile successfully created!');
}
function convertTStypeToJava(tsType) {
    var javaType;
    switch (tsType) {
        case 'string':
            javaType = 'String';
            break;
        case 'number':
            javaType = 'int';
            break;
        case 'boolean':
            javaType = 'boolean';
            break;
        case 'void':
            javaType = 'void';
            break;
        default:
            javaType = 'Unknown';
    }
    return javaType;
}
function locateTypeToCategory(tmpParamType) {
    var tmpPrimitiveTypes = ['void', 'int', 'bool'];
    var tmpOtherTypes = ['String'];
    if (tmpPrimitiveTypes.includes(tmpParamType)) {
        if (!primitiveTypesTab.includes(tmpParamType)) {
            primitiveTypesTab.push(tmpParamType);
        }
    }
    if (tmpOtherTypes.includes(tmpParamType)) {
        if (!otherTypesTab.includes(tmpParamType)) {
            otherTypesTab.push(tmpParamType);
        }
    }
}
function retrieveModifiedAttribute(myInput, myParam) {
    if (myInput.indexOf(myParam) > -1) {
        var lParam = '';
        var lStartText = 'this.';
        var lCount = lStartText.length;
        if (myInput.indexOf('=' + myParam) == -1) {
            lParam = '= ' + myParam;
        }
        else {
            lParam = '=' + myParam;
        }
        var lStartPos = myInput.indexOf(lStartText);
        var lEndPos = myInput.indexOf(lParam);
        var lOutput1 = myInput.substring(lStartPos + lCount, lEndPos);
        var lOutput2 = lOutput1.trim();
        return lOutput2;
    }
    else {
        return '';
    }
}
function getPropertyWithoutType(myInput) {
    var result = '';
    var pos = myInput.indexOf(':');
    var tmpText = myInput.substring(0, pos);
    result = tmpText.trim();
    return result;
}
function checkAnEntityModifier(anEntity, aString) {
    // Checking the modifiers
    var nbModifiers = anEntity.getModifiers().length;
    if (nbModifiers > 0) {
        var aTab = new Array();
        anEntity.getModifiers().forEach(function (mod) {
            aTab.push(mod.getText());
        });
        aString += "        (modifiers";
        aTab.forEach(function (element) {
            aString += " '" + element + "'";
        });
        aString += ")\n";
    }
}
