export default function getCurrentAllotmentData(allotmentArray, subjectId, mode) {
    // console.log("called");
    for (let i = 0; i < allotmentArray.length; i++) {
        if (allotmentArray[i].subject.id === subjectId) {
            if (mode === "L") {
                return allotmentArray[i].allotted_lecture_hours;
            } else if (mode === "T") {
                return allotmentArray[i].allotted_tutorial_hours;
            } else if (mode === "P") {
                return allotmentArray[i].allotted_practical_hours;
            }
        }
    }
    return 0;
}
