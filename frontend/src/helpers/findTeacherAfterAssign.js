export default function findTeacherAfterAssign(array, id) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].teacher.id === id) {
            return array[i];
        }
    }
    return null;
}
