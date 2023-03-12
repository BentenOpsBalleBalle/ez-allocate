import setColor from "../../helpers/SetColor";
import { useState } from "react";
import "./test.css";

const AssignTeacherCard = ({ choice_number, teacher, subjectData }) => {
    // console.log(subjectData);
    // const subjectMaxHours = {
    //     lecture: subjectData.original_lecture_hours,
    //     tutorial: subjectData.original_tutorial_hours,
    //     practical: subjectData.original_practical_hours,
    // };

    const subjectLeftHours = {
        lecture:
            subjectData.original_lecture_hours -
            subjectData.allotted_lecture_hours,
        tutorial:
            subjectData.original_tutorial_hours -
            subjectData.allotted_tutorial_hours,
        practical:
            subjectData.original_practical_hours -
            subjectData.allotted_practical_hours,
    };

    // console.log(subjectLeftHours, "subjectLeftHours");
    const [lecture, setLecture] = useState(0);
    const [tutorial, setTutorial] = useState(0);
    const [practical, setPractical] = useState(0);

    // console.log(setColor(teacher.assigned_status));

    const MODES = {
        L: {
            label: "Lecture",
            state: lecture,
            setState: setLecture,
        },
        T: {
            label: "Tutorial",
            state: tutorial,
            setState: setTutorial,
        },
        P: {
            label: "Practical",
            state: practical,
            setState: setPractical,
        },
    };

    // function handleMinus(label, setState) {
    //     setState((prev) => {
    //         if (prev === 0) return 0;
    //         return prev - 1;
    //     });
    // }

    // function handlePlus(label, setState) {
    //     setState((prev) => {
    //         // console.log(subjectMaxHours[label.toString().toLowerCase()]);
    //         if (prev >= subjectMaxHours[label.toString().toLowerCase()])
    //             return prev;
    //         return prev + 1;
    //     });
    // }

    return (
        <div className="w-56 bg-gray-100 p-4 rounded-lg drop-shadow-md ">
            <div className="flex items-center gap-x-8">
                <img
                    className="rounded-full w-[60px] h-[60px]"
                    src={`https://api.dicebear.com/5.x/initials/svg?seed=${
                        teacher.name
                    }&backgroundColor=${setColor(teacher.assigned_status)}`}
                    alt={teacher.name}
                />
                <div>
                    <div>{teacher.name}</div>
                    {/* this is teacher total current load and not for this subject only */}
                    <div>Total {teacher.current_load}</div>
                </div>
            </div>
            {/* {console.log(buttons["L"])} */}
            <div className="mt-2 flex flex-col gap-y-2">
                {teacher.preferred_mode.split("").map((mode, idx) => {
                    return (
                        <div className="flex justify-between" key={idx}>
                            <div>{MODES[mode].label}</div>
                            <Slider
                                min={0}
                                max={
                                    subjectLeftHours[
                                        MODES[mode].label
                                            .toString()
                                            .toLowerCase()
                                    ]
                                }
                                value={MODES[mode].state}
                                setState={MODES[mode].setState}
                            />
                            {/* <div className="flex gap-x-2 items-center bg-white">
                                <button
                                    className="bg-black text-white px-2 py-1 rounded-md"
                                    onClick={() =>
                                        handleMinus(
                                            MODES[mode].state,
                                            MODES[mode].setState
                                        )
                                    }
                                >
                                    -
                                </button>
                                <div>{[MODES[mode].state]}</div>
                                <button
                                    className="bg-black text-white px-2 py-1 rounded-md"
                                    onClick={() =>
                                        handlePlus(
                                            MODES[mode].label,
                                            MODES[mode].setState
                                        )
                                    }
                                >
                                    +
                                </button>
                            </div> */}
                        </div>
                    );
                })}
            </div>

            <div
                onClick={() => {
                    console.log(lecture, tutorial, practical);
                }}
                className="mt-2 text-center bg-green-400 rounded-[5px] py-1 cursor-pointer"
            >
                <button>Assign</button>
            </div>
        </div>
    );
};

const Slider = ({ min, max, value, setState }) => {
    const handleOnChange = (event) => {
        const newValue = parseInt(event.target.value, 10);
        setState(newValue);
    };

    const handleOnMouseMove = (event) => {
        const currentValue = parseInt(event.target.value, 10);
        event.target.title = currentValue;
    };
    return (
        <div className="flex items-center gap-x-2">
            <span className="">{min}</span>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={handleOnChange}
                onMouseMove={handleOnMouseMove}
                className={` ${
                    min == max
                        ? "bg-black ok"
                        : "bg-green-300 hover:bg-green-500"
                } w-20 h-1  appearance-none rounded-full   outline-none cursor-pointer`}
            />
            <span className="">{max}</span>
        </div>
    );
};

export default AssignTeacherCard;
