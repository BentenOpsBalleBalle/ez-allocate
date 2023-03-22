import { useNavigate } from "react-router-dom";
import setColor from "../../helpers/setColor";
import { Tag } from "@geist-ui/core";

export function TeacherCard({
    name,
    preferred_mode,
    id,
    assigned_status,
    current_load,
}) {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(`/teachers/${id}`);
    };
    return (
        <div
            onClick={handleClick}
            className="w-72  border relative shadow-xl rounded-xl  flex flex-col gap-y-2 cursor-pointer"
        >
            <img
                src={`https://api.dicebear.com/5.x/initials/svg?seed=${name}&backgroundColor=${setColor(
                    assigned_status
                )}`}
                alt="login"
                className="h-40 w-72 rounded-xl object-cover"
            />

            <div>
                <div className="text-l font-sans font-bold ml-2 flex items-center justify-between">
                    <div>{name}</div>
                    {/* <div className="relative mr-[20px]">
                        <Capacity value={current_load} limit={14} />
                        <div className="absolute left-1/2 top-1/2 text-[8px] -translate-x-1/2 -translate-y-1/2">
                            {current_load}
                        </div>
                    </div> */}
                    <Tag invert type="default" mr="6px">
                        Current Load {current_load}
                    </Tag>
                </div>
                <div className="flex gap-2 px-2 rounded-md bg-red-100 w-16 text-center m-2">
                    <div className="font-bold">{preferred_mode[0]}</div>
                    <div className="font-bold">{preferred_mode[1]}</div>
                    <div className="font-bold">{preferred_mode[2]}</div>
                </div>
            </div>
        </div>
    );
}
