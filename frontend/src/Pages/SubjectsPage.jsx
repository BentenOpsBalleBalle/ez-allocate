import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { request } from "../helpers/Client";
import FetchingIndicator from "../components/common/FetchingIndicator";
import { Pagination } from "../components/common/Pagination";
import { Drawer, Popover, Tag, Checkbox } from "@geist-ui/core";
import { FiSearch } from "react-icons/fi";
import SubjectCard from "../components/Subject Components/SubjectCard";
import { CustomSearch } from "../components/common/CustomSearch";
import { useNavigate } from "react-router-dom";
import ExportComp from "../components/ExportComp";

function SubjectsPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState(false);
    const [coursetypeFilters, setCoursetypeFilters] = useState([]);
    const [programmeFilters, setProgrammeFilters] = useState([]);
    const [searchUsingFilters, setSearchUsingFilters] = useState(false);
    const subjectsQuery = useQuery(
        ["subjects", { page }],
        () =>
            request.send({
                url: `api/subjects/?page=${page}`,
                method: "GET",
                service: "allocate",
            }),
        {
            keepPreviousData: true,
        }
    );

    const typeContent = [
        { label: "Core", value: "core" },
        { label: "Elective", value: "elec" },
        { label: "Specialization", value: "spec" },
    ];

    const programmeContent = [
        { label: "Btech", value: "btech" },
        { label: "Mtech", value: "mtech" },
        { label: "Phd", value: "phd" },
    ];

    const CheckBoxContent = (content, state, setState) => {
        return (
            <div className="p-4">
                <Checkbox.Group
                    value={state}
                    onChange={(value) => setState(value)}
                >
                    <div className="flex flex-col gap-y-4 items-start">
                        {content.map((item, idx) => (
                            <Checkbox key={idx} value={item.value}>
                                {item.label}
                            </Checkbox>
                        ))}
                    </div>
                </Checkbox.Group>
            </div>
        );
    };

    const handler = (value) => {
        // console.log(value);
        if (value == false) {
            console.log(programmeFilters, coursetypeFilters);
            setSearchUsingFilters(true);
        }
    };

    return (
        <div className="w-screen h-screen pt-2  overflow-x-hidden">
            <div className="flex flex-col lg:flex-row  gap-y-4 justify-between px-8 items-center">
                <div className="flex flex-col  md:flex-row gap-y-2.5 gap-x-[100px] items-center ">
                    <div className="title font-bold truncate relative flex items-center gap-x-4">
                        <div className=" text-[40px]">S U B J E C T S</div>

                        <div className="">
                            <FetchingIndicator />
                        </div>
                    </div>
                    <div className="flex gap-x-4">
                        <div className="flex gap-x-2 items-center">
                            <div className="w-5 h-5 bg-red-400 rounded-sm" />
                            <div>NONE</div>
                        </div>
                        <div className="flex gap-x-2 items-center">
                            <div className="w-5 h-5 bg-green-400 rounded-sm" />
                            <div>FULL</div>
                        </div>
                        <div className="flex gap-x-2 items-center">
                            <div className="w-5 h-5 bg-yellow-400 rounded-sm" />
                            <div>PARTIAL</div>
                        </div>
                    </div>
                    <div>
                        <ExportComp />
                    </div>
                </div>

                <Drawer
                    visible={search}
                    onClose={() => setSearch(false)}
                    placement="right"

                    // height="100%"
                >
                    <Drawer.Title>Search</Drawer.Title>
                    <Drawer.Subtitle>Look for subject</Drawer.Subtitle>
                    <Drawer.Content>
                        <CustomSearch
                            searchFor="subjects"
                            onSelect={(value) => {
                                console.log(value);
                                navigate(`/subjects/${value}`);
                            }}
                            width="400px"
                        />
                    </Drawer.Content>
                </Drawer>
                <div className="flex items-center ">
                    <span
                        className="mr-6 text-2xl cursor-pointer"
                        onClick={() => setSearch(true)}
                    >
                        <FiSearch />
                    </span>
                    <div
                        onClick={() => navigate("/teachers")}
                        className="border border-blue-300 bg-blue-700 text-white font-mono text-xl font-bold rounded-lg px-3 py-1 cursor-pointer"
                    >
                        Teachers
                    </div>
                </div>
            </div>

            <div className="flex justify-center mt-6 gap-x-8">
                <Popover
                    // onVisibleChange={handler}
                    content={() =>
                        CheckBoxContent(
                            typeContent,
                            coursetypeFilters,
                            setCoursetypeFilters
                        )
                    }
                    className="cursor-pointer"
                >
                    <Tag>Course Type</Tag>
                </Popover>

                <Popover
                    onVisibleChange={handler}
                    content={() =>
                        CheckBoxContent(
                            programmeContent,
                            programmeFilters,
                            setProgrammeFilters
                        )
                    }
                    className="cursor-pointer"
                >
                    <Tag>Programme</Tag>
                </Popover>
            </div>

            {subjectsQuery.isError ? (
                <div className="text-red-500 text-center text-xl font-bold">
                    {subjectsQuery.error.message}
                </div>
            ) : (
                <>
                    {subjectsQuery.isLoading ? null : (
                        <div className="flex mt-6 flex-wrap gap-8  justify-center">
                            {/* {console.log(subjectsQuery.data)} */}
                            {subjectsQuery.data.data.results.map((subject) => (
                                <SubjectCard
                                    key={subject.id}
                                    name={subject.name}
                                    allotmentStatus={subject.allotment_status}
                                    id={subject.id}
                                    course_code={subject.course_code}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            <Pagination setPage={setPage} page={page} query={subjectsQuery} />
        </div>
    );
}

export default SubjectsPage;
