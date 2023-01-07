
import {
    baseExtract,
    clearSkills,
    getSkills,
    setListing,
    skillsToExtract
} from './cvParser';

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

jest.spyOn(global.console, 'log').mockImplementation(() => jest.fn());

describe("Test regexes", () => {

    beforeAll(() => {

    });

    beforeEach(() => {
        clearSkills();
    });

    test(`C : don't confuse with C++ and C#`, () => {

        setListing(`Not that that is C++, C# etc.`);

        baseExtract("C", skillsToExtract["C"]["regex"]);
        expect(getSkills()).not.toEqual(['C'])

    });

    test(`C : don't get confused by slashes`, () => {

        setListing(`and (cbc/cbc), bilingual`);

        baseExtract("C", skillsToExtract["C"]["regex"]);
        expect(getSkills()).not.toEqual(['C'])

    });

    test(`C : cs at end of file`, () => {

        setListing(`bilingual c`);

        baseExtract("C", skillsToExtract["C"]["regex"]);
        expect(getSkills()).toEqual(['C'])

    });

    test(`HTML : html at start of string`, () => {

        setListing(`html bilingual c`);

        baseExtract("HTML", skillsToExtract["HTML"]["regex"]);
        expect(getSkills()).toEqual(['HTML'])

    });



});
