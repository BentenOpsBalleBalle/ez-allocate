export const formatDate = (inputString) => {
    const date = new Date(inputString);
    const options = { day: "numeric", month: "long", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
};
