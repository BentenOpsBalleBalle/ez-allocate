import { useNavigate } from "react-router-dom";

function SubjectCard({ name, allotmentStatus, id, course_code }) {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(`/subjects/${id}`);
    };
    return (
        <div
            onClick={handleClick}
            className={`card relative w-64 h-60 rounded-md m-3 pb-10 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 ... shadow-[0_9px_17px_-6px_rgba(0,0,0,0.3)] ${
                allotmentStatus === "PART"
                    ? "bg-yellow-400"
                    : allotmentStatus == "FULL"
                    ? "bg-green-400 "
                    : "bg-red-400"
            }`}
        >
            <img
                src="../../src/assets/login.jpg"
                alt=""
                className="object-cover w-64 h-40 pt-0 rounded-l"
            />
            <div className="title text-[15px] mt-[5px] ml-[10px] mb-[5px] truncate font-bold">
                {name}
            </div>
            <div className="title text-[18px] mt-[5px] ml-[10px] mb-[5px] font-bold">
                {course_code}
            </div>
        </div>
    );
}

export default SubjectCard;
