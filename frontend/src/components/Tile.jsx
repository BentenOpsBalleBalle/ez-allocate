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
                    {allotment.subject_id}
                </div>
                <div className="text-[20px] pl-2 font-semibold">
                    Operating System
                </div>
                <div className="text-[22px] pl-2 font-semibold text-orange-700">
                    8
                </div>
            </div>
            {Open ? (
                <DropDown
                    lecture={allotment.alloted_lecture}
                    practical={allotment.alloted_practical}
                    tutorial={allotment.alloted_tutorial}
                />
            ) : null}
        </div>
    );
}

export default Tile;
