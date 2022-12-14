# CV Optimizer

This program converts a CV (in json format) to a CV tailored to specific job listings.

It extracts keywords from the job listing and prioritizes items in the CV which correspond to those skills.

There are three export formats:
- a stripped-down json object with the attributes for internal use by the program removed.
- an indented .txt file
- Yet to be completed, the program will be able to fill in sections of a pdf formatted in Adobe InDesign

## How to use:

1. Rewrite your CV in JSON format. See my CV, included in this repository, for an example. (The "importance" and "skills demonstrated" sections are particularly important, as they help the program navigate through the CV's internal structure.)
2. save your CV as "cv.json"
3. run `npm install` to download all packages used by the repo.
4. Then for each position you wish to apply for, do the following: 
    1. In the `/Job_Listing` folder, fill out information in the config.json file. The most important thing is to include the name of the position (or at least the employer), and the formats you want the program to export to. (json, text or pdf)
    5. Then copy-paste the text of the original job posting into the `listing.txt` file (you can leave this blank for speculative or inventory applications)
    6. Run the program with `node ./cvParser`
    7. The program will then make a duplicate of the `/Job_Listing` folder with the customized CV and Cover Letter inside it.

## How to test:

Jest support for ES Modules is experimental, run the tests with:<br/>
`node --experimental-vm-modules node_modules/jest/bin/jest.js`<br/>
individual test suites are run with:<br/>
`node --experimental-vm-modules node_modules/jest/bin/jest.js ./cvParser.test.js`

## How to hire me:

I'm presently looking for an entry-level software development job.<br>
Message me on Github or LinkedIn (the included sample CV contains a link).<br>
But do so quickly! With this script in existence, I don't expect to be looking for long!

