import DropDown from "./DropDown";
import { useState } from "react";

function Tile({ allotment }) {
    const [Open, setOpen] = useState(false);
    const toggle = () => setOpen(!Open);
    return (
        <div
            className={`m-auto p-4 rounded-l shadow-lg w-full aria-expanded=${Open}`}
            onClick={toggle}
        >
            <div className="button  aria-expanded={isOpen} cursor-pointer flex justify-between items-center w-full">
                <div className="bg-cyan-500 shadow-lg shadow-cyan-500/50 p-4 rounded-l text-white">
                    {allotment.subject.course_code}
                </div>
                <div className="text-[20px] pl-2 font-semibold">
                    {allotment.subject.name}
                </div>
                <div className="text-[22px] pl-2 font-semibold text-orange-700">
                    {allotment.allotted_lecture_hours +
                        allotment.allotted_tutorial_hours +
                        allotment.allotted_practical_hours}
                </div>
            </div>
            {Open ? (
                <DropDown
                    lecture={allotment.allotted_lecture_hours}
                    practical={allotment.allotted_tutorial_hours}
                    tutorial={allotment.allotted_practical_hours}
                />
            ) : null}
        </div>
    );
}

export default Tile;
