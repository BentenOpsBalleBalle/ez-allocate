export default function getChoiceColor(choice) {
    const manual = "#FFB6B9";
    const first = "#FAE3D9";
    const second = "#BBDED6";
    const third = "#61C0BF";

    if (choice === 0) {
        return manual;
    } else if (choice === 1) {
        return first;
    } else if (choice === 2) {
        return second;
    } else if (choice === 3) {
        return third;
    }
}
