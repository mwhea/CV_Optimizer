
let recursionDepth = 0;
let textString = "";
let skillsSought = [];

export function tabulate(json) {

    let thisScore = 0;
    let scorers = 0;
    
    if (json.importance!==undefined){
        return parseInt(json.importance);
    }

    for (let i in json) {

        if (Array.isArray(json[i]) || typeof json[i] === 'object') { 
            
            let score=parseInt(tabulate(json[i])); 
            if (score>=3){scorers++}
            if(score>thisScore){
                thisScore=score;
            }
        }

    }

    if (scorers>1){thisScore += (scorers-1);}

    return thisScore;
}


export function recurseAnd(json, callback) {


    callback(json)

    for (let i in json) {
        recursionDepth++;
        if (Array.isArray(json[i]) || typeof json[i] === 'object') { 
            recurseAnd(json[i], callback); 
        }
        recursionDepth--;
    }
}

export function sortSections(cv) {

    recurseAnd(cv, (json) => {
        if (Array.isArray(json) && json.length>0 && json[0].duration===undefined){
            json.sort((a, b)=>{
                let aOrdering = 0;
                let bOrdering = 0;
                if (a.order !== undefined) { aOrdering = parseInt(a.order); }
                if (b.order !== undefined) { bOrdering = parseInt(b.order); }
                if (a.order === undefined && b.order === undefined) {
                    aOrdering = tabulate(a);
                    bOrdering = tabulate(b);
                }
                else {
                    aOrdering*=-1;
                    bOrdering*=-1;
                }
                return (bOrdering - aOrdering);
            })
            // for (let i in json) {
            //     console.log(tabulate(json[i])+": "+json[i].description
            //     );}
        }
    })

}

export function isCategory(obj) {

    if (tabulate(obj) <= 0){return false;}
    if (obj.importance !== undefined){return false;}
    return true;

}

export function isSupercategory(obj) {
    let isSupercategory = false;
    if (Array.isArray(obj)) {
        isSupercategory = obj.reduce((isCat, o) => {
            if (isCategory(o)) {
                isCat = true;
            }
            return isCat;
        }, false)

    }

    else {
        const keys = Object.keys(obj);
        if (keys.length === 0) { return false; }
        keys.forEach((i) => {
            if (isCategory(obj[i]) && i!=="duties") {
                isSupercategory = true;
            }
        });
    }
    return isSupercategory;
}

export function removeUnpromisingCategories(input) {

    recurseAnd(input, (obj) => {

        if (isSupercategory(obj)) {

            if (Array.isArray(obj)) {
                for (let i = 0; i<obj.length; i++){
                    
                    if (isCategory(obj[i]) && tabulate(obj[i]) < 3) {
                        obj.splice(i, 1); 
                        i--;
                    }
                }
                // obj = obj.filter((o)=>{
                //     return (isCategory(o) && tabulate(o) < 3);})
        
            }
            else if (typeof obj === 'object') {
        
                const keys = Object.keys(obj);
        
                // Iterate over the own properties of the object.
                keys.forEach((key) => {
                    
                    if (isCategory(obj[key]) && tabulate(obj[key]) < 3) {
                        delete obj[key];
                    }
                });
            }
        }
        
    })
}



export function adjustImportances(input, skills) {

    skillsSought = skills;

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

export function removeOnes(cv){
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

export function convertObjectsToStrings(cv) {
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

export function convertToText(cv){
    textString="";

    recurseAnd(cv, (obj) => {
        for (let i in obj) {
            if (!Array.isArray(obj[i])){
            for(let j = 0; j<recursionDepth; j++){
                textString +='  '
            }
            textString += obj[i] + '\n';
        }
        }
    });

    return textString;

}

export function removeSkillLists(cv) {

    recurseAnd(cv, (obj) => {

        for (let i in obj) {

            if (obj[i]["skills demonstrated"] !== undefined) {
                delete obj[i]["skills demonstrated"];
            }
        }

    });


}

export function removeEmpty(cv) {

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

