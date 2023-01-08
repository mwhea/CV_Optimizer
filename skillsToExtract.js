
/**
 * An object with all the skills which should be extracted from a job listing, and what method to use to detect them.
 *  "regex": search based on a regular expression
 *  "string": search for a substring (not case sensitive)
 *  "caseSensitive": search for a substring (case sensitive)
 *  "shortString" : search for a substring, but make sure it isn't part of a larger word. E.G. Ensure "Javascript" doesn't count towards "Java"
 *  "supersetOf": include certain broad skills based on the presence of other skills. 
 *      ^Be careful with this one. Just because a listing references JUnit, that doesn't necessarily mean they care about your experience with Python testing frameworks.
 */

export const skillsToExtract = {

    /* Regex Resources
        https://regex101.com/r/DlNrO4/1 
        https://www.autoregex.xyz/
    */

    ".NET": { regex: [/[^\w]\.net\b/i, /asp\.net/i] },
    "Angular": { string: ["angular"] },
    "Assembly": { string: ["assembly", "assembler"] },
    "AWS": { caseSensitive: ["AWS"] },
    "Azure": { caseSensitive: ["Azure"] },
    "Mobile Apps": { string: ["app develop", "mobile develop", "mobile app"] },
    "bash": { string: [" bash"] },
    "Bootstrap": { string: ["bootstrap"] },
    "C": { regex: [/\bc\b(?![\+\#])/i] },
    "C++": { regex: [/c\+\+/i] },
    "C#": { regex: [/c#/i] },
    "CSS": { string: ["css"] },
    "Docker": { string: ["docker"] },
    "Eclipse": { string: ["eclipse"] },
    "gcc": { string: ["gcc"] },
    "gdb": { string: ["gdb"] },
    "git": { string: ["version control"], shortString: ["git"] },
    "grep": { string: ["grepping", "grep for"] },
    "HTML": { regex: [/(?<!\.)html/i] },
    "Java": { shortString: ["java"], supersetOf: ["Java EE"] },
    "Java EE": { string: ["java ee", "java enterprise"] },
    "Javascript": { string: ["javascript"], supersetOf: ["React", "Angular", "NodeJS"]},
    "Jest": { string: ["jest"] },
    "Jira": { string: ["jira"] },
    "JUnit": { string: ["junit"] },
    "Kubernetes": { string: ["kubernetes"] },
    "Linux": { string: ["linux", "ubuntu"], caseSensitive: ["RHEL"]},
    "Momentics": { string: ["momentics"] },
    "NetBeans": { string: ["netbeans"] },
    "Neutrino": { string: ["neutrino"] },
    "NodeJS": { string: ["nodejs", " node", "node.js"] },    
    "PHP": { shortString: ["php"] },
    "Postgres": { string: ["postgr"] },
    "Python": { string: ["python"] },
    "React": { caseSensitive: ["React"] , string: ["reactjs", "react.js"] },
    "shell scripting": { string: ["powershell", "command line", "scripting", "shell script"] },
    "Typescript": { string: ["typescript"] },
    "Tailwind": { string: ["tailwind"] },
    "Vim": { shortString: ["vim"] },
    "Visual Studio": { string: ["visual studio"] },
    "VMs": { caseSensitive: ["VM"] },
    "VS Code": { string: ["vs code"] },
    "Wireshark": { string: ["wireshark"] },
    "Wordpress": { string: ["wordpress"] },

    //broad Categories
    "Cloud": { string: ["cloud"], supersetOf: ["AWS", "Azure"]},
    "Creativity": { string: ["creativ"] },
    "Communication": { string: ["communication"] },
    "Containers": { string: ["containeriz", "containers"], supersetOf: ["Docker"] },
    "Databases": { string: ["database", "entity framework"], caseSensitive: ["SQL", " DB"], supersetOf: ["Postgres", "MySQL"] },
    "Humor": { shortString: ["fun"], string: ["humour", "humor"] },
    "FrontEnd": { supersetOf: ["Tailwind", "Bootstrap", "CSS", "Wordpress"] },
    "GameDev": { string: ["game dev", "games"] },
    "Linux": { supersetOf: ["bash"] },
    "Low-Level": { string: ["systems program", "system program"], supersetOf: ["C", "C++", "Assembly"]},
    "Networking": { string: ["osi model", "networks", "networking"], supersetOf: ["Wireshark"] },
    "RTOS": { caseSensitive: ["RTOS"], supersetOf: ["Neutrino"] },
    "Servers": { caseSensitive: ["SSH"] },
    "shell scripting": { supersetOf: ["bash"] },
    "Space": { string: ["satellite", "rocket"] },
    "Teamwork": { string: ["jira", "collabor", "leadership"] },
    "Testing": { string: ["testing", "test-driven"], caseSensitive: ["TDD"] },
    "Time Management": { string: ["time manag", "autonom", "self-motivated", "initiative"] },
    "WebDev": { string: ["web deve", "front end", "frontend", "front-end", "full stack", "full-stack"], supersetOf: ["CSS", "HTML", "React", "Angular", "Tailwind", "Wordpress"] },

};
