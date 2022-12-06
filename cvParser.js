import {
    readFile,
    writeFile,
    cp
} from 'fs/promises';

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
let textString = "";

let cv = JSON.parse(await readFile(new URL(`./cv.json`, import.meta.url)));
let listing = await readFile(new URL(`./Job_Listing/listing.txt`, import.meta.url));
listing = listing.toString().replace(/(\r\n|\n|\r)/gm, " ");
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


let folderName = './'+config["job title"].replace(/[/\\?%*:|"<>]/g, "")+"/";
await cp(`./Job_Listing/`, folderName, {"force": true, "recursive":true})

console.log("Extracted skills from listing:");
extractSkills();

adjustImportances(cv, skillsSought);
removeUnpromisingCategories(cv);
sortSections(cv);
removeOnes(cv);
removeEmpty(cv);
convertObjectsToStrings(cv);

textString = convertToText(cv, "");
if (exports.json){await writeFile(`${folderName}${(cv["Contact Info"].name).replace(" ", "_")}_CV.json`, JSON.stringify(cv));}
if (exports.text){await writeFile(`${folderName}${(cv["Contact Info"].name).replace(" ", "_")}_CV.txt`, textString);}

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
    extractSkill("Databases", ["entity framework"]);
    extractSkill("Docker", ["docker"]);
    extractSkill("Eclipse", ["eclipse"]);
    extractSkill("git", ["git", "version control"]);
    extractSkill("grep",["grepping", "grep for"]);
    extractSkill("Java", [" java ", "java, ", "java."]);
    extractSkill("Javascript", ["javascript"]);
    extractSkill("Jira", ["jira"]);
    extractSkill("Kubernetes", ["kubernetes"]);
    extractSkill("Linux", ["linux"]);
    extractSkill("NodeJS", ["nodejs", " node"]);
    extractSkill("Postgres", ["postgr"]);
    extractSkill("React", ["reactjs", "react, "]);
    extractSkill("shell scripting",["powershell", "command line", "scripting"]);
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
    extractSkill("Teamwork", ["jira", "collabor"]);
    extractSkill("Networking", ["osi model", "networks", "networking"]);
    extractSkill("GameDev", ["game dev", "games"]);
    extractSkill("WebDev", ["web deve", "front end", "frontend", "front-end"]);
    extractSkill("Low-Level", ["systems program"]);
    extractSkill("Creativity", ["creativ"]);

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
