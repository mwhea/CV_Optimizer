
import {
    baseExtract,
    clearSkills,
    getSkills,
    setListing,
    extractSkill,
    dontExtractFragments,
    extractSkills
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

//sample listing drawn from https://in.indeed.com/career-advice/finding-a-job/job-description-for-programmer

let sampleListing = `Job Description For A Programmer (With Skills And Salary)

By Indeed Editorial Team

Published 29 November 2021

The Indeed Editorial Team comprises a diverse and talented team of writers, researchers and subject matter experts equipped with Indeed's data and insights to deliver useful tips to help guide your career journey.

A programmer can build software solutions that can improve people's lives at scale. Programming is also a skill that allows you to pursue opportunities in diverse fields, such as finance, healthcare, education or marketing. Gaining knowledge about the various roles and responsibilities of a programmer and the skills required to become one can help you decide if this can be a suitable career choice.

In this article, we discuss the job description for a programmer, their primary roles and responsibilities, steps to become a programmer, hard and soft skills for this role, the work environment of a programmer, the average salary they earn and why this career has a high employment outlook.
Top job searches near you
Part time jobs
Full time jobs
Work from home jobs
Hiring immediately jobs
View more jobs on Indeed
Sample job description for a programmer

Here are some sample job descriptions for a programmer:
Sample job description 1

We are looking for an organised and technically proficient programmer to create and maintain our organisation's systems software and IT infrastructure. The programmer's responsibilities include:

    system performance management,

    technical assistance,

    reviewing and upgrading current programmes,

    finding and fixing bugs,

    assisting with data architecture,

    generating reports,

    developing in-house software and minimising potential risk.

Your proficiency with programming languages will aid our business in boosting efficiency and service by constructing, maintaining and simplifying our computer systems and programmes.
Sample job description 2

Wavewood Inc. is seeking experienced programming with good communication skills. The candidate is expected to have at least three years of experience in programming jobs. The candidate must be able to write code for computer programs and mobile applications. They may maintain, debug and troubleshoot in-house systems and software to ensure that everything runs smoothly.
Primary roles and responsibilities of a programmer

The programmer's responsibility is to define, develop, test, analyse and maintain new software programmes that help businesses meet their requirements. This includes writing software programmes and apps, along with testing and analysing them. Additionally, the programmer conducts research, designs, documents and modifies software specifications throughout the product's life.

Following are some key role responsibilities of a programmer:

    Designing and testing computer structures

    Troubleshooting system errors and writing computer instructions

    Maintaining operating systems

    Developing and analysing algorithms

    Implementing build systems

    Fixing bugs in existing programs

    Developing and deploying web applications

    Executing code builds on staging and production environments

    Collaborating with design and marketing teams

    Providing documentation, training and support for software products

    Resolving user-submitted issues and questions

A good programmer has the following hard and soft skills:
Hard skills

    Data structure: Data structures enable programmers to organise data inside pre-defined frameworks, which improves communication between back-end processes and front-end consumers.

    HyperText markup language (HTML): HTML helps organise the content and structure of a web page. It is the basic building block for almost all websites.

    Cascading style sheets (CSS): CSS is critical for front-end web development as it includes information and instructions about how a web page should look and structure for navigation.

    JavaScript (JS): It is a high-level programming language for building web applications. It allows the creation of advanced user interaction with a web page.

    Structured Query Language (SQL): It is a programming language used to connect website back end to databases.

    Git: It is the most extensively used modern version control system. Git enables programmers to monitor and manage changes to their source code throughout the development process.

    Application programming interface (APIs): APIs enable one program to use the capabilities of another. They provide a mechanism for two different programs to communicate.

Soft skills

    Problem-solving: A competent programmer understands how to fix problems within the software they program. Problems happen no matter where you work or what you try to build, so understanding how to handle and solve them can be beneficial.

    Curiosity: Considering the rapid advancement of any tech-related sector, curiosity pushes a programmer to learn new skills, ultimately helping them perform effectively in their roles.

    Staying organised: As a programmer, you often work on software involving hundreds of files with thousands of lines of code. Keeping things organised helps improve easy collaboration with other programmers and avoids confusion.

    Attention to detail: A good programmer having attention to detail may catch potential problems in functionality during the development and testing of software.

    Accountability: As a programmer, you are responsible for the functionality and maintenance of the codebase, the company and the user experience of the end customers.

    Patience: Developing and testing software takes time as employers typically require testing code multiple times to find and fix bugs. A programmer should be able to stay patient while attempting various iterations of the same solution.

`;

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

    test(`C++/C#\t- Ensure punctuation marks like '+' are escaped`, () => {

        setListing(`and c++/C#, bilingual`);

        baseExtract("C++", skillsToExtract["C++"]["regex"][0]);
        baseExtract("C#", skillsToExtract["C#"]["regex"][0]);
        expect(getSkills()).toEqual(['C++', 'C#'])

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

describe("Bulk tests", () => {

    beforeEach(() => {
        clearSkills();
    });

    test(`Indeed's Sample Listing`, () => {

        setListing(sampleListing);

        extractSkills();
        expect(getSkills()).toContain('CSS');
        expect(getSkills()).toContain('Javascript');
        expect(getSkills()).toContain('Databases');
        expect(getSkills()).toContain('git');
        expect(getSkills()).toContain('WebDev');
        expect(getSkills()).toContain('Mobile Apps');

    });

});