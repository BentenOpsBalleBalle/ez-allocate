import login from "../assets/login.jpg";
import Client from "../helpers/Client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pagination } from "../components/common/Pagination";
import FetchingIndicator from "../components/common/FetchingIndicator";
import { useNavigate } from "react-router-dom";

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
                            email={teacher.email}
                            prefferred_mode={teacher.prefferred_mode}
                            id={teacher.id.$oid}
                        />
                    ))}
                </div>
            )}
            <Pagination setPage={setPage} page={page} query={teachersQuery} />
        </div>
    );
}

function TeacherCard({ name, email, prefferred_mode, id }) {
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
                src={`https://api.dicebear.com/5.x/initials/svg?seed=${name}`}
                alt="login"
                className="h-40 w-72 rounded-xl object-cover"
            />

            <div className="text-l font-sans font-bold ml-2">{name}</div>
            <div className="flex gap-2 px-2 rounded-md bg-red-100 w-16 text-center m-2">
                <div className="font-bold">{prefferred_mode[0]}</div>
                <div className="font-bold">{prefferred_mode[1]}</div>
                <div className="font-bold">{prefferred_mode[2]}</div>
            </div>
        </div>
    );
}

export default TeachersPage;
