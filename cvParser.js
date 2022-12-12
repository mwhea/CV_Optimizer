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
listing = listing.toString().replace(/(\r\n|\n|\r)/gm, " ");
let folderName = "";
let config = JSON.parse(await readFile(new URL(`./Job_Listing/config.json`, import.meta.url)));

let exports = {
    "json": false,
    "text": false,
    "pdf": false,
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
if (config["job title"] === undefined) {removeUnpromisingCategories(cv);}
sortSections(cv);
removeOnes(cv);
removeEmpty(cv);
convertObjectsToStrings(cv);

let textString = convertToText(cv, "");

/*
 * Generating the Cover Letter
 */

let coverLetter = JSON.parse(await readFile(new URL(`./cover_letter.json`, import.meta.url)));
let letterString = "";

for (let i in coverLetter){

    letterString += coverLetter[i];
    letterString += "\n\n";

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

    folderName = './'+config["job title"].replace(/[/\\?%*:|"<>]/g, "")+"/";
}
else if (config["employer"] !== "") {
    jobString += "a position with "
    jobString += config["employer"];

    folderName = './'+config["employer"].replace(/[/\\?%*:|"<>]/g, "")+"/";
}
else {
    console.warn("ERROR: You must provide either a job title or an employer name in the program configuration")
}


if (config["cover letter"]["job-specific paragraph"] !== "") {
    letterString = letterString.replace("[POSITION]. ", "[POSITION]. "+config["cover letter"]["job-specific paragraph"]+"\n\n");
}


letterString = letterString.replace("[POSITION]",jobString);

/**
 * Export Results
 */

await cp(`./Job_Listing/`, folderName, {"force": true, "recursive":true})
if (exports.json){await writeFile(`${folderName}${(cv["Contact Info"].name).replace(" ", "_")}_CV.json`, JSON.stringify(cv));}
if (exports.text){await writeFile(`${folderName}${(cv["Contact Info"].name).replace(" ", "_")}_CV.txt`, textString);}
if (exports.text || exports.text){await writeFile(`${folderName}${(cv["Contact Info"].name).replace(" ", "_")}_Cover_Letter.txt`, letterString);}



function extractSkills() {

    //A few need case to be sure, but for the rest we're going to check later with all-lowercase
    extractSkill(".NET", [".NET"]);
    extractSkill("AWS", ["AWS"]);
    extractSkill("Azure", ["Azure"]);
    extractSkill("Databases", ["SQL"]);
    extractSkill("React", ["React"]);
    extractSkill("VMs", ["VM"]);
    extractSkill("Vim",["Vim ", "Vim, ", "Vim."]);
    extractSkill("Linux", ["RHEL"]);

    listing = listing.toString().toLowerCase();

    //specific
    extractSkill(".NET", ["asp.net"]);
    extractSkill("Angular", ["angular"]);
    extractSkill("bash",[" bash"]);
    extractSkill("Bootstrap", ["bootstrap"]);
    extractSkill("C", [" c ", " c,"]);
    extractSkill("C++", ["c++"]);
    extractSkill("C#", ["c#"]);
    extractSkill("Databases", ["database", "entity framework"]);
    extractSkill("Docker", ["docker"]);
    extractSkill("Eclipse", ["eclipse"]);
    extractSkill("git", ["git", "version control"]);
    extractSkill("grep",["grepping", "grep for"]);
    extractSkill("Java", [" java ", "java, ", "java."]);
    extractSkill("Java EE", ["java ee", "java enterprise"]);
    extractSkill("Javascript", ["javascript"]);
    extractSkill("Jira", ["jira"]);
    extractSkill("Kubernetes", ["kubernetes"]);
    extractSkill("Linux", ["linux"]);
    extractSkill("NetBeans", ["netbeans"]);
    extractSkill("NodeJS", ["nodejs", " node"]);
    extractSkill("Postgres", ["postgr"]);
    extractSkill("React", ["reactjs", "react, "]);
    extractSkill("shell scripting",["powershell", "command line", "scripting"]);
    extractSkill("Testing", ["testing"]);
    extractSkill("Typescript", ["typescript"]);
    extractSkill("Tailwind", ["tailwind"]);
    extractSkill("Vim",[" vim ", " vim,", " vim."]);
    extractSkill("VS Code",["vs code"]);
    extractSkill("Visual Studio",["visual studio"]);
    extractSkill("Wireshark", ["wireshark"]);
    extractSkill("Wordpress",["wordpress"]);

    //broad
    extractSkill("Cloud", ["cloud"]);
    extractSkill("Humor", [" fun ", " fun, ", " fun. ", "humour", "humor"]);
    extractSkill("Space", ["satellite", "rocket", "launch"]);
    extractSkill("Teamwork", ["jira", "collabor", "leadership"]);
    extractSkill("Networking", ["osi model", "networks", "networking"]);
    extractSkill("GameDev", ["game dev", "games"]);
    extractSkill("WebDev", ["web deve", "front end", "frontend", "front-end"]);
    extractSkill("Low-Level", ["systems program"]);
    extractSkill("Creativity", ["creativ"]);
    extractSkill("Time Management", ["time manag", "autonom"]);

    //Add skills which are siblings of related skills
    //addSiblings("Java", "C#");

    //Infer skills which are supersets of other skills"
    inferSuperskill("Cloud", ["AWS", "Azure"]);
    inferSuperskill("Databases", ["Postgres"]);
    inferSuperskill("Networking", ["Wireshark"]);
    inferSuperskill("FrontEnd", ["Tailwind"], ["Bootstrap"], ["CSS"]);
    inferSuperskill("WebDev", ["Javascript", "Typescript", "CSS", "HTML", "React", "Angular", "Tailwind", "wordpress"]);
    inferSuperskill("Low-Level", ["C", "C++", "Assembly"]);
    inferSuperskill("shell scripting",["bash"]);
    inferSuperskill("Linux", ["bash"]);

    //Add a thing where if Typescript is a sought skill, replace every reference to Javascript

    // (string.search("java")!==-1 && string.search("javascript")===-1)
    // ){
    //     skillsSought.push("Java");
    // }

    return skillsSought;

}

function extractSkill(skill, searchStrings) {
    if (skillsSought.find((s) => s === skill) !== undefined) {
        return;
    }
    for (let i in searchStrings) {
        let searchString = searchStrings[i];
        let index = listing.indexOf(searchString);
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
