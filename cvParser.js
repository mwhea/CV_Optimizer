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
extractSkill("VMs", ["VM"]);
extractSkill("Vim",["Vim ", "Vim, ", "Vim."]);

listing = listing.toString().toLowerCase();

//specific
extractSkill(".NET", ["asp.net"]);
extractSkill("Java", [" java ", "java, ", "java."]);
extractSkill("React", ["reactjs", "react, "]);
extractSkill("Javascript", ["javascript"]);
extractSkill("Typescript", ["typescript"]);
extractSkill("Tailwind", ["tailwind"]);
extractSkill("Bootstrap", ["bootstrap"]);
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
extractSkill("Vim",[" vim ", " vim,", " vim."]);
extractSkill("Linux", ["Linux"]);
extractSkill("bash",[" bash"]);
extractSkill("shell scripting",["powershell", "command line", "scripting"]);


//broad
extractSkill("Cloud", ["cloud"]);
extractSkill("Humor", [" fun ", " fun, ", " fun. ", "humour", "humor"]);
extractSkill("Space", ["satellite", "rocket", "launch"]);
extractSkill("Teamwork", ["jira", "collabor"]);
extractSkill("Networking", ["osi model", "networks"]);
extractSkill("GameDev", ["game dev", "games"]);
extractSkill("WebDev", ["web deve", "front end", "frontend", "front-end"]);
extractSkill("Low-Level", ["systems program"]);
extractSkill("Creativity", ["creativ"]);

//Add skills which are siblings of related skills
//addSiblings("Java", "C#");

//Infer skills which are supersets of other skills"
inferSuperskill("Cloud", ["AWS", "Azure"]);
inferSuperskill("Networking", ["Wireshark"]);
inferSuperskill("FrontEnd", ["Tailwind"], ["Bootstrap"], ["CSS"]);
inferSuperskill("WebDev", ["Javascript", "Typescript", "CSS", "HTML", "React", "Angular", "Tailwind"]);
inferSuperskill("Low-Level", ["C", "C++", "Assembly"]);
inferSuperskill("shell scripting",["bash"]);
inferSuperskill("Linux", ["bash"]);



// (string.search("java")!==-1 && string.search("javascript")===-1)
// ){
//     skillsSought.push("Java");
// }


console.log("Extracted skills from listing:");
for (let i in skillsSought) {
    console.log(skillsSought[i]);
}


adjustImportances(cv);

removeOnes(cv);

removeUnpromisingCategories(cv);

sortSections(cv);

removeEmpty(cv);
convertObjectsToStrings(cv);


//console.log(cv["Hard Skills"]["Networking"]);

if (exportTo === "json") {
    await writeFile(`./Michael_Wheatley_CV.json`, JSON.stringify(cv));
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

function recurseAnd(json, callback) {

    callback(json)

    for (let i in json) {

        if (Array.isArray(json[i]) || typeof json[i] === 'object') { 
            recurseAnd(json[i], callback); 
        }

    }
}

function tabulate(json) {

    let thisScore = 0;
    
    if (json.importance!==undefined){
        return parseInt(json.importance);
    }

    for (let i in json) {

        if (Array.isArray(json[i]) || typeof json[i] === 'object') { 
            
            let score=parseInt(tabulate(json[i])); 
            if(score>thisScore){thisScore=score;}
        }

    }

    for (let i in json) {

        if (Array.isArray(json[i]) || typeof json[i] === 'object') { 
            
            let score=parseInt(tabulate(json[i])); 
            if(score>=3){thisScore++;}
        }

    }

    return thisScore;
}

function removeUnpromisingCategories(input) {

    recurseAnd(input, (obj) => {

        let isSupercategory = true;
        for (let i in obj) {
            if (obj[i].importance!==undefined || obj[i].duties!==undefined ){
                isSupercategory=false;
            }
        }
        if (isSupercategory) {
            for (let i in obj) {
                if (tabulate(obj[i]) > 0) {
                    obj[i] = ruc(obj[i]);
                }
            }
        }
    }
    )
}

function ruc(obj){
    if (Array.isArray(obj)) {
        let newArr = obj.filter(
            (e) => {
                return (tabulate(e) > 2);
            }
        );
        obj = newArr.splice(0, newArr.length);
        
    }
    else if (typeof obj === 'object') {
        for (let i in obj) {
            if (tabulate(obj[i]) < 3) {
                delete obj[i];
            }
        }
    }
    return obj;
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

            obj["importance"] = parseInt(obj["importance"]) + 1;
        }

    });
}

function removeOnes(cv){
    recurseAnd(cv, (obj) => {
        let markedForDeletion = [];
        //let len = 
        for (let i in obj) {

            if (obj[i].importance === undefined) {
            }
            else if (obj[i].importance < 2) {
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
    }
    )
}

function convertObjectsToStrings(cv) {
    recurseAnd(cv, (obj) => {

        //let len = 
        for (let i in obj) {

            if (obj[i].importance === undefined) {
            }
            else {
                if (obj[i].name !== undefined) {
                    obj[i] = obj[i].name;
                }
                else if (obj[i].description !== undefined) {
                    obj[i] = obj[i].description;
                }
            }
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

function sortSections(cv) {

    recurseAnd(cv, (obj) => {
        let tally = 0;

        for (let i in obj) {

        }
    })

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