import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { request } from "../helpers/Client";
import Tile from "./Teacher Components/Tile";
import CircularApexChart from "./Teacher Components/ApexChart";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const Teacher = () => {
    const { id } = useParams();

    const navigate = useNavigate();
    const [totalLecture, setTotalLecture] = useState(0);
    const [totalTutorial, setTotalTutorial] = useState(0);
    const [totalPractical, setTotalPractical] = useState(0);
    const teacherAllotmentsQuery = useQuery(
        ["teachers", +id, "allotments"],
        () =>
            request.send({
                url: `api/teachers/${id}/allotments`,
                method: "GET",
                service: "allocate",
            })
    );

    const teachersChoiceQuery = useQuery(
        ["teachers", +id, "choices"],
        () =>
            request.send({
                url: `api/teachers/${id}/choices`,
                method: "GET",
                service: "allocate",
            }),
        {
            staleTime: Infinity,
        }
    );

    useMemo(() => {
        // console.log("memo");
        teacherAllotmentsQuery.data?.data?.map((allotment) => {
            setTotalLecture((prev) => prev + allotment.allotted_lecture_hours);
            setTotalTutorial(
                (prev) => prev + allotment.allotted_tutorial_hours
            );
            setTotalPractical(
                (prev) => prev + allotment.allotted_practical_hours
            );
        });
    }, [teacherAllotmentsQuery.data?.data]);

    const teacherQuery = useQuery(["teachers", +id], () =>
        request.send({
            url: `api/teachers/${id}/`,
            method: "GET",
            service: "allocate",
        })
    );

    // if (teacherAllotmentsQuery.isLoading) return <div>Loaifng...</div>;

    return teacherQuery.isLoading ? (
        <div>loading...</div>
    ) : (
        <div className="flex w-screen h-screen items-center justify-between  ">
            <div className="card relative w-[55%] h-[86%] overflow-y-auto  rounded-md m-10 p-5 shadow-[0_9px_17px_-6px_rgba(0,0,0,0.2)]">
                <div className="text-center  text-[30px] pt-10 font-bold">
                    {teacherQuery.data?.data?.name}
                </div>
                <div className="text-[20px] pl-5 pb-5 font-semibold">
                    Subjects Alloted
                </div>
                {teacherAllotmentsQuery.isLoading ? (
                    <div>...</div>
                ) : (
                    teacherAllotmentsQuery.data?.data?.map((allotment) => {
                        return (
                            <Tile
                                allotment={allotment}
                                key={allotment.subject.id}
                            />
                        );
                    })
                )}
            </div>
            {teachersChoiceQuery.isLoading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid grid-cols-2 gap-x-10 gap-y-10 mr-10">
                    {teachersChoiceQuery.data.data.map((choice) => {
                        if (choice.choice_number != 0) {
                            return (
                                <div
                                    className="bg-blue-100 cursor-pointer"
                                    onClick={() => {
                                        navigate(
                                            `/subjects/${choice.subject.id}`
                                        );
                                    }}
                                >
                                    <div className="text-[20px] font-bold">
                                        {choice.subject.name}-
                                        {choice.subject.course_code}
                                    </div>
                                    <div className="text-[20px] ">
                                        Choice Number: {choice.choice_number}
                                    </div>
                                </div>
                            );
                        }
                    })}
                </div>
            )}
            {/* <div className=" w-1/2 h-1/2 mr-10 rounded-md m-10 p-5 shadow-[0_9px_17px_-6px_rgba(0,0,0,0.2)]">
                <CircularApexChart
                    lecture={totalLecture}
                    practical={totalPractical}
                    tutorial={totalTutorial}
                />
            </div> */}
        </div>
    );
};

export default Teacher;
