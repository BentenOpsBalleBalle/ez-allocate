import Client from "../helpers/Client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pagination } from "../components/common/Pagination";
import FetchingIndicator from "../components/common/FetchingIndicator";
import { useNavigate } from "react-router-dom";
import setColor from "../helpers/setColor";
import axios from "axios";

const client = new Client();

const getTeachers = async (page) => {
    return await client.createUrl({
        url: `http://localhost:3000/teachers?page=${page}&limit=8`,
        method: "GET",
    });
};

function TeachersPage() {
    const [page, setPage] = useState(1);
    const teachersQuery = useQuery(
        ["teachers", { page }],
        () => getTeachers(page),
        {
            keepPreviousData: true,
        }
    );

    // async function ok() {
    //     const response = await axios.get("http://localhost:8000/api/subjects/");
    //     console.log(response.data);
    // }
    // ok();

    if (teachersQuery.isError) {
        return <p>Error: {teachersQuery.error.message}</p>;
    }

    return (
        <div>
            <div className="title text-[35px] ml-[30px] mr-[15px] font-bold flex items-center">
                T E A C H E R S
                <FetchingIndicator />
            </div>

            {teachersQuery.isLoading ? null : (
                <div className="flex mt-6 flex-wrap gap-8  justify-center">
                    {teachersQuery.data.data.map((teacher) => (
                        <TeacherCard
                            key={teacher.id.$oid}
                            name={teacher.name}
                            assigned_status={teacher.assigned_status}
                            preffered_mode={teacher.preffered_mode}
                            id={teacher.id.$oid}
                        />
                    ))}
                </div>
            )}
            <Pagination setPage={setPage} page={page} query={teachersQuery} />
        </div>
    );
}

function TeacherCard({ name, preffered_mode, id, assigned_status }) {
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
            <div className="flex  items-center text-center">
                <div className="w-8 h-8 rounded-full bg-red-100">
                    {preffered_mode[0]}
                </div>
                <div className="w-8 h-8 rounded-full bg-red-100">
                    {preffered_mode[1]}
                </div>
                <div className="w-8 h-8 rounded-full bg-red-100">
                    {preffered_mode[2]}
                </div>
            </div>
        </div>
    );
}

export default TeachersPage;
