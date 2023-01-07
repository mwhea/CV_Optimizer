
import {
    baseExtract,
    clearSkills,
    getSkills,
    setListing,
    extractSkill,
    dontExtractFragments
} from './cvParser';

import { skillsToExtract } from './skillsToExtract.js';

import { jest } from '@jest/globals'

global.console = {
    ...console,
    // uncomment to ignore a specific log level
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    // warn: jest.fn(),
    // error: jest.fn(),
};

//jest.spyOn(global.console, 'log').mockImplementation(() => jest.fn());

/* Regex Resources
https://regex101.com/r/DlNrO4/1 
https://www.autoregex.xyz/
*/

describe("Test grouped criteria", () => {

    beforeEach(() => {
        clearSkills();
    });

    test(`'Array of candidate strings' - A of pair`, () => {

        setListing(`bilingual cdatabase`);

        extractSkill("Databases", skillsToExtract["Databases"]["string"]);

        expect(getSkills()).toEqual(['Databases'])

    });
    test(`'Array of candidate strings' - B of pair`, () => {

        setListing(`sdfentity frameworksfd`);

        extractSkill("Databases", skillsToExtract["Databases"]["string"]);

        expect(getSkills()).toEqual(['Databases']);
    });
    test(`'Array of candidate strings' - Negative example`, () => {

        setListing(`false positive`);

        extractSkill("Databases", skillsToExtract["Databases"]["string"]);

        expect(getSkills()).not.toEqual(['Databases']);

    });

    test(`'Array of regexes' - A of pair`, () => {

        setListing(`bilingual /.net cdatabase`);

        extractSkill(".NET", skillsToExtract[".NET"]["regex"]);

        expect(getSkills()).toEqual(['.NET'])

    });
    test(`'Array of regexes' - B of pair`, () => {

        setListing(`sdf asp.net fd`);

        extractSkill(".NET", skillsToExtract[".NET"]["regex"]);

        expect(getSkills()).toEqual(['.NET']);
    });
    test(`'Array of regexes' - Negative example`, () => {

        setListing(`false positive: microsoft.net `);

        extractSkill(".NET", skillsToExtract[".NET"]["regex"]);

        expect(getSkills()).not.toEqual(['.NET']);

    });

});

describe("Test short string automatic regex converter", () => {

    beforeEach(() => {
        clearSkills();
    });

    test(`Simple Positive Example`, () => {

        setListing(`the java language`);

        dontExtractFragments("Java", skillsToExtract["Java"]["shortString"]);
        expect(getSkills()).toEqual(['Java'])

    });

    test(`Simple Negative Example`, () => {

        setListing(`the javascript language`);

        dontExtractFragments("Java", skillsToExtract["Java"]["shortString"]);
        expect(getSkills()).not.toEqual(['Java'])

    });

});

describe("Test regexes", () => {

    beforeEach(() => {
        clearSkills();
    });

    test(`C\t\t- C at end of file`, () => {

        setListing(`bilingual c`);

        baseExtract("C", skillsToExtract["C"]["regex"][0]);
        expect(getSkills()).toEqual(['C'])

    });

    test(`C\t\t- don't confuse with C++ and C#`, () => {

        setListing(`Not that that is C++, C# etc.`);

        baseExtract("C", skillsToExtract["C"]["regex"][0]);
        expect(getSkills()).not.toEqual(['C'])

    });

    test(`C\t\t- don't get confused by slashes`, () => {

        setListing(`and (cbc/cbc), bilingual`);

        baseExtract("C", skillsToExtract["C"]["regex"][0]);
        expect(getSkills()).not.toEqual(['C'])

    });

    test(`HTML\t- html at start of string`, () => {

        setListing(`html bilingual c`);

        baseExtract("HTML", skillsToExtract["HTML"]["regex"][0]);
        expect(getSkills()).toEqual(['HTML'])

    });

    test(`HTML\t- html at end of string`, () => {

        setListing(`bilingual cHTML`);

        baseExtract("HTML", skillsToExtract["HTML"]["regex"][0]);
        expect(getSkills()).toEqual(['HTML'])

    });

    test(`HTML\t- don't gather URLS`, () => {

        setListing(`www.johnsmith.html `);

        baseExtract("HTML", skillsToExtract["HTML"]["regex"][0]);
        expect(getSkills()).not.toEqual(['HTML'])

    });

    test(`HTML\t- don't skip HTML5`, () => {

        setListing(`blah HTML5 blah`);

        baseExtract("HTML", skillsToExtract["HTML"]["regex"][0]);
        expect(getSkills()).toEqual(['HTML'])

    });

    test(`.NET\t- simple positive example`, () => {

        setListing(` microsoft .NET MVC Framework`);

        baseExtract(".NET", skillsToExtract[".NET"]["regex"][0]);
        expect(getSkills()).toEqual(['.NET'])

    });

    test(`.NET\t- simple negative example`, () => {

        setListing(`Microsoft MVC Framework`);

        baseExtract(".NET", skillsToExtract[".NET"]["regex"][0]);
        expect(getSkills()).not.toEqual(['.NET'])

    });

    test(`.NET\t- don't gather URLS`, () => {

        setListing(`also www.gwern.net is one`);

        baseExtract(".NET", skillsToExtract[".NET"]["regex"][0]);
        expect(getSkills()).not.toEqual(['.NET'])

    });

});
