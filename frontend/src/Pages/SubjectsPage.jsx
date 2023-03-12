import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Client from "../helpers/Client";
import FetchingIndicator from "../components/common/FetchingIndicator";
import { Pagination } from "../components/common/Pagination";

import SubjectCard from "../components/SubjectCard";

const client = new Client();

const getSubjects = async (page) => {
    return await client.createUrl({
        url: `http://localhost:3000/test?page=${page}&limit=8`,
        method: "GET",
    });
};
function SubjectsPage() {
    const [page, setPage] = useState(1);
    const subjectsQuery = useQuery(
        ["subjects", { page }],
        () => getSubjects(page),
        {
            keepPreviousData: true,
        }
    );

    if (subjectsQuery.isError) {
        return <p>Error: {subjectsQuery.error.message}</p>;
    }

    return (
        <div className="w-screen h-screen pt-2  overflow-x-hidden">
            <div className="flex justify-between px-8 items-center">
                <div className="flex gap-x-[100px] items-center ">
                    <div className="title font-bold truncate relative flex items-center gap-x-4">
                        <div className=" text-[40px]">S U B J E C T S</div>

                        <div className="">
                            <FetchingIndicator />
                        </div>
                    </div>
                    <div className="flex gap-x-4">
                        <div className="flex gap-x-2 items-center">
                            <div className="w-5 h-5 bg-red-400 rounded-sm" />
                            <div>No teachers available</div>
                        </div>
                        <div className="flex gap-x-2 items-center">
                            <div className="w-5 h-5 bg-green-400 rounded-sm" />
                            <div>Subject Alloted</div>
                        </div>
                        <div className="flex gap-x-2 items-center">
                            <div className="w-5 h-5 bg-yellow-400 rounded-sm" />
                            <div>Subject to be alloted</div>
                        </div>
                    </div>
                </div>

                <div className="border border-blue-300 bg-blue-700 text-white font-mono text-xl font-bold rounded-lg px-3 py-1 cursor-pointer">
                    Teachers
                </div>
            </div>

            {subjectsQuery.isLoading ? null : (
                <div className="flex mt-6 flex-wrap gap-8  justify-center">
                    {subjectsQuery.data.data.map((subject) => (
                        <SubjectCard
                            key={subject._id.$oid}
                            name={subject.name}
                            allotmentStatus={subject.allotment_status}
                            id={subject.id}
                        />
                    ))}
                </div>
            )}

            <Pagination setPage={setPage} page={page} query={subjectsQuery} />
        </div>
    );
}

export default SubjectsPage;
