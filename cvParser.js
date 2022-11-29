import {
    renameSync,
    statSync,
    existsSync,
    realpathSync
} from 'fs';

import {
    readFile,
    writeFile
} from 'fs/promises';

/*
Todo:
    edit linkedin
    write formatted json
*/

/* The modes are:
 -text
 -json
 -pdf
*/
// const exportTo = "text";
const exportTo = "json";
// const exportTo = "pdf";

let cv = await readFile(new URL(`./cv.json`, import.meta.url));
cv = JSON.parse(cv);

let listing = await readFile(new URL(`./Job_Listing/job.txt`, import.meta.url));

let skillsSought = [];


listing = listing.toString().replace(/(\r\n|\n|\r)/gm, " ");

//A few need case to be sure, but for the rest we're going to check later with all-lowercase
extractSkill("React", ["React"]);
extractSkill("AWS", ["AWS"]);
extractSkill("Azure", ["Azure"]);
extractSkill("Databases", ["SQL"]);
extractSkill(".NET", [".NET"]);

listing = listing.toString().toLowerCase();

//specific
extractSkill(".NET", ["asp.net"]);
extractSkill("Java", [" java ", "java, ", "java."]);
extractSkill("React", ["reactjs", "react, "]);
extractSkill("Javascript", ["javascript"]);
extractSkill("Typescript", ["typescript"]);
extractSkill("Tailwind", ["tailwind"]);
extractSkill("Angular", ["angular"]);
extractSkill("C", [" c ", " c,"]);
extractSkill("C++", ["c++"]);
extractSkill("C#", ["c#"]);
extractSkill("Jira", ["jira"]);
extractSkill("NodeJS", ["nodejs", " node"]);
extractSkill("Linux", ["linux"]);
extractSkill("Docker", ["docker"]);
extractSkill("Wireshark", ["wireshark"]);
extractSkill("git", ["git", "version control"]);

//broad
extractSkill("Cloud", ["cloud"]);
extractSkill("Humor", [" fun ", " fun, ", " fun. ", "humour", "humor"]);
extractSkill("Space", ["satellite", "rocket", "launch"]);
extractSkill("Teamwork", ["jira", "collabor"]);
extractSkill("Networking", ["osi model", "networks"]);
extractSkill("GameDev", ["game dev", "games"]);
extractSkill("WebDev", ["web deve", "front end", "frontend", "front-end"]);
extractSkill("Low-Level", ["systems program"]);

//Add skills which are siblings of related skills
//addSiblings("Java", "C#");

//Infer skills which are supersets of other skills"
inferSuperskill("Cloud", ["AWS", "Azure"]);
inferSuperskill("Networking", ["Wireshark"]);
inferSuperskill("WebDev", ["Javascript", "Typescript", "CSS", "HTML", "React", "Angular", "Tailwind"]);
inferSuperskill("Low-Level", ["C", "C++", "Assembly"]);


// (string.search("java")!==-1 && string.search("javascript")===-1)
// ){
//     skillsSought.push("Java");
// }


console.log("Extracted skills from listing:");
for (let i in skillsSought) {
    console.log(skillsSought[i]);
}

adjustImportances(cv);

convertObjectsToStrings(cv);

removeEmpty(cv);

console.log(cv["Hard Skills"]["Networking"]);

if (exportTo === "json") {
    await writeFile(`./Michael_Wheatley_CV.json`, JSON.stringify(cv));
}

while (1);


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


function recurseAnd(json, callback) {

    callback(json)

    for (let i in json) {

        if (Array.isArray(json[i]) || typeof json[i] === 'object') { 
            recurseAnd(json[i], callback); 
        }

    }
}



function adjustImportances(input) {

    recurseAnd(input, (obj) => {

        let anySkills = false;
        if (obj["skills demonstrated"] !== undefined) {

            for (let i in obj["skills demonstrated"]) {

                if (skillsSought.find((s) => { return s === obj["skills demonstrated"][i]; })) {
                    anySkills = true;
                }
            }
        }
        if (anySkills === true) {

            obj["importance"] = parseInt(obj["importance"]) + 2;
        }

    });
}

function convertObjectsToStrings(cv) {
    recurseAnd(cv, (obj) => {

        let markedForDeletion = [];
        //let len = 
        for (let i in obj) {

            if (obj[i].importance === undefined) {
            }
            else if (obj[i].importance >= 3) {
                if (obj[i].name !== undefined) {
                    obj[i] = obj[i].name;
                }
                else if (obj[i].description !== undefined) {
                    obj[i] = obj[i].description;
                }
            }
            else if (obj[i].importance < 3) {
                if (Array.isArray(obj)) {
                    markedForDeletion.push(i);
                }
                else { delete obj[i]; }
            }
        }
        for (let i in markedForDeletion) {

            obj.splice(markedForDeletion[markedForDeletion.length - 1 - i], 1);
        }
        return false;

    });
}
function removeSkillLists(cv) {

    recurseAnd(cv, (obj) => {

        for (let i in obj) {

            if (obj[i]["skills demonstrated"] !== undefined) {
                delete obj[i]["skills demonstrated"];
            }
        }

    });


}

function removeEmpty(cv) {

    recurseAnd(cv, (obj) => {
        let markedForDeletion = [];

        for (let i in obj) {
            if ((Array.isArray(obj[i]) && obj[i].length === 0)
                || (typeof obj[i] === 'object' && Object.keys(obj[i]).length === 0)) {

                if (Array.isArray(obj)) {
                    markedForDeletion.push(i);
                }
                else if (typeof obj === 'object') {
                    delete obj[i];
                }
            }
        }

        for (let i in markedForDeletion) {
            obj.splice(markedForDeletion[markedForDeletion.length - 1 - i], 1);
        }
    }
    )

}