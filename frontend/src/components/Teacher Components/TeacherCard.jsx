import { useNavigate } from "react-router-dom";
import setColor from "../../helpers/setColor";

export function TeacherCard({ name, preferred_mode, id, assigned_status }) {
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

            <div className="text-l font-sans font-bold ml-2">{name}</div>
            <div className="flex gap-2 px-2 rounded-md bg-red-100 w-16 text-center m-2">
                <div className="font-bold">{preferred_mode[0]}</div>
                <div className="font-bold">{preferred_mode[1]}</div>
                <div className="font-bold">{preferred_mode[2]}</div>
            </div>
        </div>
    );
}