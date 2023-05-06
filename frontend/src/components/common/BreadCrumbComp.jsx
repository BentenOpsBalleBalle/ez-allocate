import { useNavigate } from "react-router-dom";

const breadCrumbsMap = new Map();
breadCrumbsMap.set("Home", "/subjects");
breadCrumbsMap.set("Teachers", "/teachers");
breadCrumbsMap.set("Files", "/files");

const BreadCrumbComp = () => {
    const navigate = useNavigate();
    const handleClick = (e) => {
        navigate(breadCrumbsMap.get(e.target.innerText));
    };
    return (
        <div className="flex text-gray-600 gap-x-1">
            <div
                onClick={handleClick}
                className="cursor-pointer hover:text-blue-500"
            >
                Home
            </div>
            /
            <div
                className="cursor-pointer hover:text-blue-500"
                onClick={handleClick}
            >
                Teachers
            </div>
            /
            <div
                onClick={handleClick}
                className="cursor-pointer hover:text-blue-500"
            >
                Files
            </div>
        </div>
    );
};

export default BreadCrumbComp;
