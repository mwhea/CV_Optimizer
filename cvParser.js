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

import { skillsToExtract } from './skillsToExtract.js';

let listing;
let skillsSought = [];

export function getSkills() {
    return skillsSought;
}

export function clearSkills() {
    skillsSought = [];
}

export function setListing(string) {
    listing = string;
}


main();

async function main() {
    let cv = JSON.parse(await readFile(new URL(`./cv.json`, import.meta.url)));

    listing = await readFile(new URL(`./Job_Listing/listing.txt`, import.meta.url));
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

    if (config["export to"].find((e) => { return (e == "json"); }) !== undefined) {
        exports.json = true;
    }
    if (config["export to"].find((e) => { return (e == "text"); }) !== undefined) {
        exports.text = true;
    }
    if (config["export to"].find((e) => { return (e == "pdf"); }) !== undefined) {
        exports.pdf = true;
    }
    if (config["export to"].find((e) => { return (e == "debug"); }) !== undefined) {
        exports.debug = true;
    }

    console.log("Exporting to:")
    for (let i in exports) {
        if (exports[i]) { console.log(`-${i}`) }
    }

    skillsSought.push(...config["skills not in listing"])

    /*==========================
     * Generate Curriculum Vitae
     =============================*/

    console.log("Extracted skills from listing:");
    extractSkills();

    adjustImportances(cv, skillsSought);
    debugString = JSON.stringify(cv);
    if (listing !== "") { removeUnpromisingCategories(cv); }
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

    /*=================================
     * Generating the Cover Letter
     =================================*/

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
        let vowels = ['a', 'i', 'e', 'o', 'u', 'A', 'I', 'E', 'O', 'U'];
        if (vowels.find((v) => { return (v === config["job title"][0]); }) !== undefined) { jobString += "an "; }
        else { jobString += "a "; }
        jobString += config["job title"]
        if (config["employer"] !== "") {
            jobString += " with "
            jobString += config["employer"];
        }

        folderName = './' + config["employer"].replace(/[/\\?%*:|"<>]/g, "").replace(/[\ ]/g, "_") + "_" + config["job title"].replace(/[/\\?%*:|"<>]/g, "").replace(/[\ ]/g, "_") + "/";
    }
    else if (config["employer"] !== "") {
        jobString += "a position with "
        jobString += config["employer"];

        folderName = './' + config["employer"].replace(/[/\\?%*:|"<>]/g, "").replace(/[\ ]/g, "_") + "/";
    }
    else {
        console.warn("ERROR: You must provide either a job title or an employer name in the program configuration")
    }


    if (config["cover letter"]["job-specific paragraph"] !== "") {
        letterString = letterString.replace("[POSITION]. ", "[POSITION]. " + config["cover letter"]["job-specific paragraph"] + "\n\n");
    }


    letterString = letterString.replace("[POSITION]", jobString);

    if (config["job title"] !== undefined) {
        letterString = letterString.replace("[POSITION/ORG]", "the position");
    }
    else {
        letterString = letterString.replace("[POSITION/ORG]", "a position with " + ["employer"]);
    }

    /**====================
     * Export Results
     =====================*/

    await cp(`./Job_Listing/`, folderName, { "force": true, "recursive": true })
    if (exports.json) { await writeFile(`${folderName}${(cv["Contact Info"].name).replace(/[\ ]/g, "_")}_CV.json`, JSON.stringify(cv)); }
    if (exports.debug) { await writeFile(`${folderName}${(cv["Contact Info"].name).replace(/[\ ]/g, "_")}_debug.json`, debugString); }
    if (exports.text) { await writeFile(`${folderName}${(cv["Contact Info"].name).replace(/[\ ]/g, "_")}_CV.txt`, textString); }
    if (exports.text || exports.text) { await writeFile(`${folderName}${(cv["Contact Info"].name).replace(/[\ ]/g, "_")}_Cover_Letter.txt`, letterString); }

}


export function extractSkills() {

    let skillNames = Object.keys(skillsToExtract);

    for (let i in skillNames) {

        let extractionTypes = Object.keys(skillsToExtract[skillNames[i]]);

        for (let j in extractionTypes){

            if (extractionTypes[j] === "regex") {
                if (regexExtract(skillNames[i], skillsToExtract[skillNames[i]].regex)) { break; }
            }
            else if (extractionTypes[j] === "string") {
                if (extractSkill(skillNames[i], skillsToExtract[skillNames[i]].string)) { break; }
            }
            else if (extractionTypes[j] === "shortString") {
                if (dontExtractFragments(skillNames[i], skillsToExtract[skillNames[i]].shortString)) { break; }
            }
            else if (extractionTypes[j] === "caseSensitive") {
                if (extractSkill(skillNames[i], skillsToExtract[skillNames[i]].caseSensitive), "g") { break; }
            }
        }
    }

    for (let i in skillNames) {

        if (isSkillAlreadyPresent(skillNames[i])) {
            return;
        }

        if (skillsToExtract[skillNames[i]].supersetOf !== undefined) {
            inferSuperskill(skillNames[i], skillsToExtract[skillNames[i]].supersetOf);
        }
    }

    //TODO: Add a thing where if Typescript is a sought skill, replace every reference to Javascript

    //TODO: Add skills which are siblings of related skills
    //addSiblings("Java", "C#");

    return skillsSought;

}

function addSkill(skill){

    if (isSkillAlreadyPresent(skill)) {
        console.log(`Tried to add ${skill} but it was already present. This isn't supposed to happen`)
    }
    else {
        skillsSought.push(skill);
    }

}

function isSkillAlreadyPresent(skill){
    if (skillsSought.find((s) => s === skill) !== undefined) {
        return true;
    }
    else {
        return false;
    }
}

export function dontExtractFragments(skill, searchString) {

    let regexes = [];
    for (let i in searchString) {
        regexes.push(new RegExp("\\b" + searchString[i] + "\\b", "i"))
    }

    return regexExtract(skill, regexes);

}

export function extractSkill(skill, searchStrings, flags) {

    let theseFlags = flags;
    if (theseFlags === undefined) {
        theseFlags = "i";
    }
    if (skillsSought.find((s) => s === skill) !== undefined) {
        return true;
    }
    for (let i in searchStrings) {
        if (baseExtract(skill, new RegExp(searchStrings[i], theseFlags))){return true;}
    }
    return false;

}

export function baseExtract(skill, regex) {
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

        addSkill(skill);
        return true;
    }
    else {
        return false;
    }
}

export function regexExtract(skill, regexes) {
    for (let i in regexes) {
        if (baseExtract(skill, new RegExp(regexes[i]))) {return true;}
    }
    return false;

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
                addSkill(skill);
                return;
            }
        }
    }
}
