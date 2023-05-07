import { useNavigate } from "react-router-dom";
import { Tooltip, Tag } from "@geist-ui/core";
import { Badge } from "antd";
function SubjectCard({
    name,
    allotmentStatus,
    id,
    course_code,
    course_type,
    programme,
}) {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(`/subjects/${id}`);
    };
    if (course_type === "ELEC") course_type = "ELECTIVE";
    return (
        <Badge.Ribbon text={`${course_type} - ${programme}`} color="magenta">
            <div
                className={`card  relative w-64 h-60 rounded-md m-3 pb-10 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 ... shadow-[0_9px_17px_-6px_rgba(0,0,0,0.3)] ${
                    allotmentStatus === "PART"
                        ? "bg-yellow-400"
                        : allotmentStatus == "FULL"
                        ? "bg-green-400 "
                        : "bg-red-400"
                }`}
            >
                <img
                    onClick={handleClick}
                    src="/login.jpg"
                    alt=""
                    className="cursor-pointer object-cover w-64 h-40 pt-0 rounded-l"
                />
                <div className="title text-[15px] mt-[5px] ml-[10px] mb-[5px] truncate font-bold">
                    {name}
                </div>
                <div className="title text-[18px] mt-[5px] ml-[10px] mb-[5px] font-bold">
                    {course_code}
                </div>
                <div className="absolute flex justify-between gap-x-[70px] items-center">
                    <Tooltip
                        type="secondary"
                        text="Lecture hours to be assigned"
                    >
                        <Tag invert>L : 2</Tag>
                    </Tooltip>
                    <Tooltip
                        type="secondary"
                        text="Tutorial hours to be assigned"
                    >
                        <Tag invert>T : 4</Tag>
                    </Tooltip>
                    <Tooltip
                        type="secondary"
                        text="Practical hours to be assigned"
                    >
                        <Tag invert>P : 6</Tag>
                    </Tooltip>
                </div>
            </div>
        </Badge.Ribbon>
    );
}

export default SubjectCard;
