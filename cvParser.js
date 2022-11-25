import {
    renameSync,
    statSync,
    existsSync
} from 'fs';

import {
    readFile,
    writeFile
} from 'fs/promises';

/*
Todo:
    how to iterate over attributes
    edit linkedin
    write formatted json
*/
const exportTo = "json";
// const exportTo = "json";
// const exportTo = "pdf";


let cv = await readFile(new URL(`./cv.json`, import.meta.url));
cv = JSON.parse(cv);

console.log(cv);

if(exportTo==="json"){
    await writeFile(`./Michael_Wheatley_CV.json`, JSON.stringify(cv));
}

while(1);