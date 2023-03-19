export default function setColor(assigned_status) {
    const red = "F87171";
    const green = "34D399";
    const yellow = "FBBF24";

    if (assigned_status == "PART") {
        return yellow;
    } else if (assigned_status == "FULL") {
        return green;
    } else if (assigned_status == "NONE") {
        return red;
    }
}
