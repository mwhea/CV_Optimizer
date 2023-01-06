import {
    readFile,
    writeFile,
    cp
} from 'fs/promises';
import { stringify } from 'querystring';

import {
    sortSections,
    adjustImportances,
    convertObjectsToStrings,
    convertToText,
    removeEmpty,
    removeOnes,
    removeUnpromisingCategories
} from './recursiveFunctions.js'

let skillsSought = [];

let cv = JSON.parse(await readFile(new URL(`./cv.json`, import.meta.url)));
let listing = await readFile(new URL(`./Job_Listing/listing.txt`, import.meta.url));
let debugString = ""
listing = listing.toString().replace(/(\r\n|\n|\r)/gm, " ");
let folderName = "";
let config = JSON.parse(await readFile(new URL(`./Job_Listing/config.json`, import.meta.url)));
let extraParas = JSON.parse(await readFile(new URL(`./extra_paragraphs.json`, import.meta.url)));

let exports = {
    "json": false,
    "text": false,
    "pdf": false,
    "debug": false
};


if (config["export to"].find((e) => { return (e == "json"); })!== undefined) {
    exports.json = true;
}
if (config["export to"].find((e) => { return (e == "text"); })!== undefined) {
    exports.text = true;
}
if (config["export to"].find((e) => { return (e == "pdf"); })!== undefined) {
    exports.pdf = true;
}
if (config["export to"].find((e) => { return (e == "debug"); })!== undefined) {
    exports.debug = true;
}

console.log("Exporting to:")
for (let i in exports) {
    if (exports[i]){    console.log(`-${i}`)}
}

skillsSought.push(...config["skills not in listing"])



/**
 * Generate Curriculum Vitae
 */

console.log("Extracted skills from listing:");
extractSkills();

adjustImportances(cv, skillsSought);
debugString = JSON.stringify(cv);
if (listing!=="") {removeUnpromisingCategories(cv);}
sortSections(cv);

removeOnes(cv);
removeEmpty(cv);

convertObjectsToStrings(cv);

if (config["include references"] === true || config["include references"] === undefined) {
}
else if (config["include references"] === false) {
    console.log("No references being added to CV.");
    delete cv["References"]
}
else {
    console.log(`"Include References" setting contains an invalid value. it should be a boolean true or false.`);
}

let textString = convertToText(cv, "");

/*
 * Generating the Cover Letter
 */

let coverLetter = JSON.parse(await readFile(new URL(`./cover_letter.json`, import.meta.url)));
let letterString = "";

for (let i in coverLetter) {

    if (coverLetter[i] === "[EXTRA PARAGRAPHS]") {
        for (let i in config["cover letter"]["subject matter paragraphs"]) {
            letterString += extraParas[(config["cover letter"]["subject matter paragraphs"][i])];
            letterString += "\n\n";
        }
    }
    else {
        letterString += coverLetter[i];
        letterString += "\n\n";
    }

}

if (config["cover letter"]["addressee"] !== "") {
    letterString = letterString.replace("[ADDRESSEE]", config["cover letter"]["addressee"]);
}
else {
    letterString = letterString.replace("[ADDRESSEE]", "Hiring Manager");
}

let jobString = ""

if (config["job title"] !== "") {
    jobString += "the open position for "
    let vowels = ['a','i','e','o','u','A','I','E','O','U'];
    if (vowels.find((v)=>{return (v===config["job title"][0]);})!== undefined) {jobString += "an ";}
    else{jobString += "a ";}
    jobString += config["job title"]
    if (config["employer"] !== "") {
        jobString += " with "
        jobString += config["employer"];
    }

    folderName = './'+config["employer"].replace(/[/\\?%*:|"<>]/g, "").replace(/[\ ]/g, "_")+"_"+config["job title"].replace(/[/\\?%*:|"<>]/g, "").replace(/[\ ]/g, "_")+"/";
}
else if (config["employer"] !== "") {
    jobString += "a position with "
    jobString += config["employer"];

    folderName = './'+config["employer"].replace(/[/\\?%*:|"<>]/g, "").replace(/[\ ]/g, "_")+"/";
}
else {
    console.warn("ERROR: You must provide either a job title or an employer name in the program configuration")
}


if (config["cover letter"]["job-specific paragraph"] !== "") {
    letterString = letterString.replace("[POSITION]. ", "[POSITION]. "+config["cover letter"]["job-specific paragraph"]+"\n\n");
}


letterString = letterString.replace("[POSITION]",jobString);

if (config["job title"]!== undefined){
letterString = letterString.replace("[POSITION/ORG]", "the position");
}
else {
    letterString = letterString.replace("[POSITION/ORG]", "a position with "+["employer"]);
}

/**
 * Export Results
 */

await cp(`./Job_Listing/`, folderName, {"force": true, "recursive":true})
if (exports.json){await writeFile(`${folderName}${(cv["Contact Info"].name).replace(/[\ ]/g, "_")}_CV.json`, JSON.stringify(cv));}
if (exports.debug){await writeFile(`${folderName}${(cv["Contact Info"].name).replace(/[\ ]/g, "_")}_debug.json`, debugString);}
if (exports.text){await writeFile(`${folderName}${(cv["Contact Info"].name).replace(/[\ ]/g, "_")}_CV.txt`, textString);}
if (exports.text || exports.text){await writeFile(`${folderName}${(cv["Contact Info"].name).replace(/[\ ]/g, "_")}_Cover_Letter.txt`, letterString);}



function extractSkills() {

    //regexes for some of the tricker ones
    regexExtract("C", /\bc\b(?![\+\#])/i);  
    regexExtract("C++", /c\+\+/i);
    regexExtract("C#", /c#/i);
    regexExtract("HTML", /(?!\.)html/i);

    regexExtract(".NET", /[^w]\.net\b/i);
    regexExtract(".NET", /asp\.net/i);

    //A few need case to be sure, but for the rest we're going to ignore case
    extractSkill("AWS", ["AWS"], "g");
    extractSkill("Azure", ["Azure"], "g");
    extractSkill("Databases", ["SQL", " DB"], "g");
    extractSkill("React", ["React"], "g");
    extractSkill("VMs", ["VM"], "g");
    extractSkill("Linux", ["RHEL"], "g");
    extractSkill("RTOS", ["RTOS"], "g");
    extractSkill("Servers", ["SSH"], "g");
    extractSkill("Testing", ["TDD"], "g");

    //specific
    extractSkill("Angular", ["angular"]);
    extractSkill("Assembly", ["assembly", "assembler"]);
    extractSkill("Mobile Apps", ["app develop", "mobile develop", "mobile app"])
    extractSkill("bash",[" bash"]);
    extractSkill("Bootstrap", ["bootstrap"]);
    extractSkill("CSS", ["css"]);
    extractSkill("Databases", ["database", "entity framework"]);
    extractSkill("Docker", ["docker"]);
    extractSkill("Eclipse", ["eclipse"]);
    extractSkill("gcc", ["gcc"]);
    extractSkill("gdb", ["gdb"]);
    dontExtractFragments("git", "git");
    extractSkill("git", ["version control"]);
    extractSkill("grep",["grepping", "grep for"]);
    dontExtractFragments("Java", "java");
    extractSkill("Java EE", ["java ee", "java enterprise"]);
    extractSkill("Javascript", ["javascript"]);
    extractSkill("Jest", ["jest"]);
    extractSkill("Jira", ["jira"]);
    extractSkill("JUnit", ["junit"]);
    extractSkill("Kubernetes", ["kubernetes"]);
    extractSkill("Linux", ["linux"]);
    extractSkill("Momentics", ["momentics"]);
    extractSkill("NetBeans", ["netbeans"]);
    extractSkill("Neutrino", ["neutrino"]);
    extractSkill("NodeJS", ["nodejs", " node", "node.js"]);
    dontExtractFragments("PHP", "php");
    extractSkill("Postgres", ["postgr"]);
    extractSkill("Python", ["python"]);
    extractSkill("React", ["reactjs", "react.js"]);
    dontExtractFragments("React", "react");
    extractSkill("shell scripting",["powershell", "command line", "scripting", "shell script"]);
    extractSkill("Typescript", ["typescript"]);
    extractSkill("Tailwind", ["tailwind"]);
    dontExtractFragments("Vim", "vim");
    extractSkill("VS Code",["vs code"]);
    extractSkill("Visual Studio",["visual studio"]);
    extractSkill("Wireshark", ["wireshark"]);
    extractSkill("Wordpress",["wordpress"]);

    //broad
    extractSkill("Cloud", ["cloud"]);
    extractSkill("Creativity", ["creativ"]);
    extractSkill("Communication", ["communication"]);
    extractSkill("Containers", ["containeriz"]);
    dontExtractFragments("Humor", "fun");
    extractSkill("Humor", ["humour", "humor"]);
    extractSkill("Networking", ["osi model", "networks", "networking"]);
    extractSkill("GameDev", ["game dev", "games"]);
    extractSkill("Low-Level", ["systems program", "system program"]);
    extractSkill("Space", ["satellite", "rocket"]);
    extractSkill("Teamwork", ["jira", "collabor", "leadership"]);
    extractSkill("Testing", ["testing", "test-driven"]);
    extractSkill("Time Management", ["time manag", "autonom", "self-motivated", "initiative"]);
    extractSkill("WebDev", ["web deve", "front end", "frontend", "front-end", "full stack", "full-stack"]);

    //Infer skills which are supersets of other skills"
    inferSuperskill("Cloud", ["AWS", "Azure"]);
    inferSuperskill("Containers", ["Docker"]);
    inferSuperskill("Databases", ["Postgres", "MySQL"]);
    inferSuperskill("Networking", ["Wireshark"]);
    inferSuperskill("FrontEnd", ["Tailwind"], ["Bootstrap"], ["CSS"]);
    inferSuperskill("Low-Level", ["C", "C++", "Assembly"]);
    inferSuperskill("shell scripting",["bash"]);
    inferSuperskill("Linux", ["bash"]);
    inferSuperskill("RTOS", ["Neutrino"]);
    inferSuperskill("WebDev", ["CSS", "HTML", "React", "Angular", "Tailwind", "wordpress"]);

    //TODO: Add a thing where if Typescript is a sought skill, replace every reference to Javascript
    
    //TODO: Add skills which are siblings of related skills
    //addSiblings("Java", "C#");

    return skillsSought;

}

function dontExtractFragments(skill, searchString){

    regexExtract(skill, new RegExp("\\b"+searchString+"[^\\w\\b]", "i"));  

}

function extractSkill(skill, searchStrings, flags) {

    let theseFlags = flags;
    if (theseFlags===undefined){
        theseFlags="i";
    }
    if (skillsSought.find((s) => s === skill) !== undefined) {
        return;
    }
    for (let i in searchStrings) {
        baseExtract(skill, new RegExp(searchStrings[i], theseFlags));  
    }
}

function baseExtract(skill, regex) {
    let index = listing.search(regex);
    if (index !== -1) {

        let startIndex = 0;
        let exerptLen = 40;

        if (index - 20 > 0) {
            startIndex = index - 20;
        }
        if (index + 20 > listing.length - 1) {
            exerptLen = listing.length - 1 - index - 20;
        }

        reportNewSkill(skill, "\"" + listing.toString().substring(startIndex, startIndex + exerptLen) + "\"");

        skillsSought.push(skill);
        return;
    }
}

function regexExtract(skill, regex) {
    if (skillsSought.find((s) => s === skill) !== undefined) {
        return;
    }

    baseExtract(skill, new RegExp(regex));  
    
}

function reportNewSkill(skill, criterion) {

    let span = "\t"
    if (skill.length < 6) { span = "\t\t"; }
    console.log("\"" + skill + "\"" + span + "based on " + criterion);

}

function inferSuperskill(skill, examples) {
    if (skillsSought.find((s) => s === skill) === undefined) {
        for (let i in examples) {

            if (skillsSought.find((s) => s === examples[i]) !== undefined) {
                reportNewSkill(skill, "presence of \"" + examples[i] + "\"");
                skillsSought.push(skill);
                return;
            }
        }
    }
}
