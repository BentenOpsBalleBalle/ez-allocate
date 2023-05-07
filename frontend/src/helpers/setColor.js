export default function setColor(assigned_status) {
    const red = "F87171";
    const green = "34D399";
    const yellow = "FBBF24";
    const blue = "3070ee";

    if (assigned_status == "PART") {
        return yellow;
    } else if (assigned_status == "FULL") {
        return green;
    } else if (assigned_status == "NONE") {
        return red;
    } else if (assigned_status == "OVER") {
        return blue;
    }
}
