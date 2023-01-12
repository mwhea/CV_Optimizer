var document = app.activeDocument;

var layers = document.layers;
var layers = document.pages;

var string = "";

//===========================================
// Displays the contents of all the pages
//===========================================

const tab = "     ";
var tboxList = "";
for (var i = 0; i < document.pages.length; i++) {

    tboxList += "PAGE " + i + ":\n";
    var tboxes = document.pages[i].textFrames;
    for (var j = 0; j < tboxes.length; j++) {

        var thisText = tboxes[j];
        tboxList += tab + j + " - name: " + tboxes[j].name + "\n";
        tboxList += tab + tab + "visible?: " + tboxes[j].visible + "\n";
        tboxList += tab + tab + "bounds: " + tboxes[j].visibleBounds[0] + ", " + tboxes[j].visibleBounds[1] + ", " + tboxes[j].visibleBounds[2] + ", " + tboxes[j].visibleBounds[3] + "\n";

        for (var k = 0; k < tboxes[j].textStyleRanges.length; k++) {
            tboxList += tab + tab + tab + "paragraph" + k + " (" + tboxes[j].textStyleRanges[k].appliedParagraphStyle.name + ")\n";
            tboxList += tab + tab + tab + tab + tboxes[j].textStyleRanges[k].contents + "\n";

            //tboxes[j].textStyleRanges[k].contents = ".";

        }
    }
}

alert(tboxList);





function trimDecimal(num) {



}

//===========================================
//  See cover letter text
//===========================================

function displayCoverLetter() {

    var coverLetter = document.pages[2].textFrames.itemByName("Cover Letter").contents;

    alert(coverLetter);
}

//===========================================
//  object.keys does not seem to be available.
//===========================================

function doesObjectDotKeysWork() {

    
    var pageAtts = Object.keys(document.pages[0]);
    var tboxAtts = Object.keys(document.pages[0].textFrames[1]);
    alert(pageAtts);
    alert(tboxAtts);

}