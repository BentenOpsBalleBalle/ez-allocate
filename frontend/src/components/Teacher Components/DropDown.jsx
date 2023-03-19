import { MdKeyboardArrowRight } from "react-icons/md";

function DropDown({ lecture, practical, tutorial }) {
    return (
        <div
            className="flex flex-col mt-4 gap-y-2"
            transition:slide={{ duration: 300 }}
        >
            <div className="flex gap-x-2 items-center ">
                <MdKeyboardArrowRight className="text-black font-bold text-xl" />
                <div className="text-[20px] pl-2 font-semibold self-end">
                    Lecture Hours :
                </div>
                <div className="text-[20px] pl-2 font-semibold">{lecture}</div>
            </div>
            <div className="flex gap-x-2 items-center">
                <MdKeyboardArrowRight className="text-black font-bold text-xl" />
                <div className="text-[20px] pl-2 font-semibold">
                    Tutorial Hours :
                </div>
                <div className="text-[20px] pl-2 font-semibold">{tutorial}</div>
            </div>
            <div className="flex gap-x-2 items-center">
                <MdKeyboardArrowRight className="text-black font-bold text-xl" />
                <div className="text-[20px] pl-2 font-semibold">
                    Practical Hours :
                </div>
                <div className="text-[20px] pl-2 font-semibold">
                    {practical}
                </div>
            </div>
        </div>
    );
}
export default DropDown;
