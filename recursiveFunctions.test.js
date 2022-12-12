

import { 
    isSupercategory, 
    isCategory, 
    tabulate, 
    removeUnpromisingCategories, 
    convertObjectsToStrings,
    sortSections,
    adjustImportances
} from './recursiveFunctions';

let blueprint = {

    "Empty Object": {},
    "Empty Array": [],
    "Object": {
        "property": "value",
        "importance": "3",
        "skills demonstrated": [
            "Skill"
        ]
    },
    "Array": [
        "array value"
    ],
    "Array of Objects": [
        {
            "property": "value",
            "importance": "3",
            "skills demonstrated": [
                "Skill"
            ]
        },
        {
            "property": "value"
        }
    ],
    "Supercategory": {
        "Programming Languages": [
            {
                "property": "skill example",
                "importance": "3",
                "skills demonstrated": [
                    "Skill"
                ]
            }
        ],
        "Database Engines": []
    },
    "Jobs": [
        {
            "position": "Good Position",
            "duties": [
                {
                    "description": "Supported day-to-day operations of Syn Studio art school, including classroom set-up, course organization, maintenance of art and study supplies, as well as tracking student participation.",
                    "importance": "3"
                },
                {
                    "description": "Prepared introductory information for newly enrolled local and international students.",
                    "importance": "3"
                }
            ]
        },
        {
            "position": "Bad Position",
            "duties": [
                {
                    "description": "duty1",
                    "importance": "1"
                },
                {
                    "description": "duty2",
                    "importance": "2"
                }
            ]
        }
    ]
}

let sample = JSON.parse(JSON.stringify(blueprint));

describe("Test categorization categorizer", () => {

    test('Is Root a superCategory?', () => {
        let testSubject = sample
        expect(isSupercategory(testSubject)).toEqual(true);

    });

    test('Are "Jobs" a supercategory?', () => {
        let testSubject = sample["Jobs"];
        try {
            expect(isSupercategory(testSubject)).toEqual(true);
        } catch (e) {
            console.log(whySupercategory(testSubject))
            throw e;
        }

    });

    test('Is "Hard Skills" a supercategory?', () => {

        let testSubject = sample["Supercategory"];
        expect(isSupercategory(testSubject)).toEqual(true);

    });

    test('Is "Databases" a category?', () => {
        let testSubject = sample["Supercategory"]["Programming Languages"]
        expect(isCategory(testSubject)).toEqual(true);

    });

    test('Is a Job a supercategory?', () => {
        let testSubject = sample["Jobs"][0]
        expect(isSupercategory(testSubject)).toEqual(false);

    });

    test('Is a Job a category?', () => {
        let testSubject = sample["Jobs"][0]
        expect(isCategory(testSubject)).toEqual(true);

    });

    //I would prefer this to be false, no special cases in the code, 
    //but there's no natural way to explude this while including groups 
    //of skills in the skills sections
    test("Is a job's duties a category?", () => {
        let testSubject = sample["Jobs"][0].duties
        expect(isCategory(testSubject)).toEqual(true);

    });
});

describe("Test point tabulation", () => {

    test('3-point object has... 3 points?', () => {
        expect(tabulate(sample["Jobs"][0].duties[0])).toEqual(3);
    });
    
    test('Good Job has 4 points?', () => {
        expect(tabulate(sample["Jobs"][0])).toEqual(4);
    });
    test('Bad Job has 2 points?', () => {
        expect(tabulate(sample["Jobs"][1])).toEqual(2);
    });

});

describe("Test category remover", () => {

   beforeAll(()=>{removeUnpromisingCategories(sample);});

    test('Do Jobs remain intact?', () => {
        expect(sample["Jobs"]).toBeDefined();

    });
    test('Is high-value job listing removed?', () => {
        expect(sample["Jobs"][0]).toBeDefined();
    });

    test('Is low-value job listing removed?', () => {
        expect(sample["Jobs"][1]).not.toBeDefined();
    });

});

describe("Test obj -> string conversion", () => {

    beforeAll(() => {
        sample = JSON.parse(JSON.stringify(blueprint));
        convertObjectsToStrings(sample);
    });

    test('Objects in a top-level array get theirs skillists removed?', () => {
        expect(sample["Array of Objects"][0].importance).not.toBeDefined();
    });

});

describe("Test sorting", () => {

    beforeEach(() => {
        sample = JSON.parse(JSON.stringify(blueprint));
    })
    test('Are skills in a skill list sorted?', () => {
        sample["Supercategory"]["Database Engines"] = [
        {
            "property": "ss1",
            "importance": "1",
            "skills demonstrated": [
                "Skill"
            ]
        },
        {
            "property": "ss2",
            "importance": "3",
            "skills demonstrated": [
                "Skill"
            ]
        }]
        sortSections(sample);
        expect(sample["Supercategory"]["Database Engines"][0]["property"]).not.toEqual("ss1");
    });
    test('Does it sort down the whole list?', () => {
        sample["Supercategory"]["Database Engines"] = [
            {
                "property": "ss1",
                "importance": "1",
                "skills demonstrated": [
                    "Skill"
                ]
            },
            {
                "property": "ss2",
                "importance": "3",
                "skills demonstrated": [
                    "Skill"
                ]
            },            {
                "property": "ss3",
                "importance": "1",
                "skills demonstrated": [
                    "Skill"
                ]
            },
            {
                "property": "ss4",
                "importance": "3",
                "skills demonstrated": [
                    "Skill"
                ]
            }]
            sortSections(sample);
        console.log(sample["Supercategory"]["Database Engines"][0]["property"]);
        expect(sample["Supercategory"]["Database Engines"][1]["property"]).toEqual("ss4");
    });
    test('Does it account for score adjustments?', () => {
        sample["Supercategory"]["Database Engines"] = [
            {
                "property": "ss1",
                "importance": "2",
                "skills demonstrated": [
                    "Skill"
                ]
            },
            {
                "property": "ss2",
                "importance": "3",
                "skills demonstrated": [
                    "Skill"
                ]
            }, {
                "property": "ss3",
                "importance": "1",
                "skills demonstrated": [
                    "Boosted Skill"
                ]
            }]
        adjustImportances(sample, ["Boosted Skill"]);
        
        sortSections(sample);
        console.log(sample["Supercategory"]["Database Engines"][0]["property"]);
        expect(sample["Supercategory"]["Database Engines"][1]["property"]).toEqual("ss3");
    });

    test('Does the lack of "skills demonstrated" properties break the sort?', () => {
        sample["Supercategory"]["Database Engines"] = [
            {
                "property": "ss1",
                "importance": "2"
            },
            {
                "property": "ss2",
                "importance": "3",
                "skills demonstrated": [
                    "Skill"
                ]
            }]
        
        sortSections(sample);
        expect(sample["Supercategory"]["Database Engines"][0]["property"]).toEqual("ss2");
    });

    test('Can sorting priority be hardcoded?', () => {
        sample["Supercategory"]["Database Engines"] = [
            {
                "property": "ss1",
                "importance": "3"
            },
            {
                "property": "ss2",
                "importance": "1",
                "order":"-1"
            }]
        
        sortSections(sample);
        expect(sample["Supercategory"]["Database Engines"][0]["property"]).toEqual("ss2");
    });

    test('How about in the opposite direction? (positive integers)', () => {
        sample["Supercategory"]["Database Engines"] = [
            {
                "property": "ss1",
                "importance": "3",
                "order":"1"
            },
            {
                "property": "ss2",
                "importance": "1"
            }]
        
        sortSections(sample);
        expect(sample["Supercategory"]["Database Engines"][0]["property"]).toEqual("ss2");
    });

    test('Are job duties sorted?', () => {
        sortSections(sample);
        expect(sample["Jobs"][1]["duties"][0]["description"]).toEqual("duty2");
    });

    test('Are categories sorted by score?', () => {

        sample["Supercategory"]["Database Engines"] = [
            {
                "property": "ss1",
                "importance": "3"
            },
            {
                "property": "ss2",
                "importance": "3"
            }, {
                "property": "ss3",
                "importance": "3"
            }]
            sortSections(sample);
        expect(Object.keys(sample["Supercategory"])[0]).toEqual("Database Engines");
    });

});


function whySupercategory(obj) {
    return obj.reduce((errorString, o) => {
        if (isCategory(o)) {
            errorString += ((o.importance + ", " + o.duties + ", " + tabulate(o)) + '\n')
        }
        return errorString;
    }, "")
}

function whyCategory(obj) {

    console.log(`${obj.importance === undefined && tabulate(obj) > 0} || ${(obj.duties === undefined && tabulate(obj) > 0)}`)

}