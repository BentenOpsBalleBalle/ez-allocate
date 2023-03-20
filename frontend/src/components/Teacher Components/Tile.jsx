import DropDown from "./DropDown";
import { useState } from "react";
import { useNavigate } from "react-router";

function Tile({ allotment }) {
    const navigate = useNavigate();
    const [Open, setOpen] = useState(false);
    const toggle = () => setOpen(!Open);
    const goToSubject = () => {
        navigate(`/subjects/${allotment.subject.id}`);
    };
    return (
        <div
            className={`m-auto p-4 rounded-l shadow-lg w-full aria-expanded=${Open}`}
        >
            <div className="button  aria-expanded={isOpen}  flex justify-between items-center w-full">
                <div
                    onClick={goToSubject}
                    className="bg-cyan-500 shadow-lg cursor-pointer shadow-cyan-500/50 p-4 rounded-l text-white"
                >
                    {allotment.subject.course_code}
                </div>
                <div
                    onClick={toggle}
                    className="text-[20px] pl-2 font-semibold cursor-pointer hover:text-blue-500"
                >
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
                    practical={allotment.allotted_practical_hours}
                    tutorial={allotment.allotted_tutorial_hours}
                />
            ) : null}
        </div>
    );
}

export default Tile;
