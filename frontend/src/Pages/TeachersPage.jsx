import Client from "../helpers/Client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pagination } from "../components/common/Pagination";
import FetchingIndicator from "../components/common/FetchingIndicator";
import { useNavigate } from "react-router-dom";
import { Drawer } from "@geist-ui/core";
import { FiSearch } from "react-icons/fi";
import { CustomSearch } from "../components/common/CustomSearch";
import { TeacherCard } from "../components/Teacher Components/TeacherCard";

// import axios from "axios";

const client = new Client();

const getTeachers = async (page) => {
    return await client.createUrl({
        url: `api/teachers/?page=${page}`,
        method: "GET",
        service: "allocate",
    });
};

function TeachersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState(false);
    const navigate = useNavigate();
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
            <div className="title text-[35px] ml-[30px] mr-[15px] font-bold flex justify-between items-center">
                <div>
                    T E A C H E R S
                    <FetchingIndicator />
                </div>

                <div
                    className="mr-12 text-2xl cursor-pointer"
                    onClick={() => setSearch(true)}
                >
                    <FiSearch />
                </div>
            </div>

            <Drawer
                visible={search}
                onClose={() => setSearch(false)}
                placement="right"

                // height="100%"
            >
                <Drawer.Title>Search</Drawer.Title>
                <Drawer.Subtitle>Look for teacher</Drawer.Subtitle>
                <Drawer.Content>
                    <CustomSearch
                        searchFor="teachers"
                        onSelect={(value) => {
                            console.log(value);
                            navigate(`/teachers/${value}`);
                        }}
                        width="400px"
                    />
                </Drawer.Content>
            </Drawer>

            {teachersQuery.isLoading ? null : (
                <div className="flex mt-6 flex-wrap gap-8  justify-center">
                    {teachersQuery.data.data.results.map((teacher) => (
                        <TeacherCard
                            key={teacher.id}
                            name={teacher.name}
                            assigned_status={teacher.assigned_status}
                            preferred_mode={teacher.preferred_mode}
                            id={teacher.id}
                        />
                    ))}
                </div>
            )}
            <Pagination setPage={setPage} page={page} query={teachersQuery} />
        </div>
    );
}

export default TeachersPage;
