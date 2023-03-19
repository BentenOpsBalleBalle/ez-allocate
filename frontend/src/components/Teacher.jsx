import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import Client from "../helpers/Client";
import Tile from "./Teacher Components/Tile";
import CircularApexChart from "./Teacher Components/ApexChart";
import { useState, useMemo } from "react";

const client = new Client();

const Teacher = () => {
    const { id } = useParams();
    // const queryClient = useQueryClient();
    let renderedTiles;
    const [totalLecture, setTotalLecture] = useState(0);
    const [totalTutorial, setTotalTutorial] = useState(0);
    const [totalPractical, setTotalPractical] = useState(0);
    const teacherAllotmentsQuery = useQuery(
        ["teachers", +id, "allotments"],
        () =>
            client.createUrl({
                url: `api/teachers/${id}/allotments`,
                method: "GET",
                service: "allocate",
            })
    );
    useMemo(
        () =>
            teacherAllotmentsQuery.data?.data?.map((allotment) => {
                setTotalLecture(
                    (prev) => prev + allotment.allotted_lecture_hours
                );
                setTotalTutorial(
                    (prev) => prev + allotment.allotted_tutorial_hours
                );
                setTotalPractical(
                    (prev) => prev + allotment.allotted_practical_hours
                );
            }),
        [teacherAllotmentsQuery.data]
    );

    const teacherQuery = useQuery(["teachers", +id], () =>
        client.createUrl({
            url: `api/teachers/${id}/`,
            method: "GET",
            service: "allocate",
        })
    );

    if (teacherAllotmentsQuery.isLoading) return <div>Loaifng...</div>;

    return teacherQuery.isLoading ? (
        <div>loading...</div>
    ) : (
        <div className="flex w-screen h-screen items-center justify-between  ">
            {console.log(teacherQuery)}
            <div className="card relative w-[55%] h-[86%]  rounded-md m-10 p-5 shadow-[0_9px_17px_-6px_rgba(0,0,0,0.2)]">
                <div className="text-center  text-[30px] pt-10 font-bold">
                    {teacherQuery.data?.data?.name}
                </div>
                <div className="text-[20px] pl-5 pb-5 font-semibold">
                    {console.log()}
                    Subjects Alloted
                </div>
                {teacherAllotmentsQuery.isLoading ? (
                    <div>...</div>
                ) : (
                    teacherAllotmentsQuery.data?.data?.map((allotment) => {
                        // totalLecture += allotment.allotted_lecture_hours;
                        // totalTutorial += allotment.allotted_tutorial_hours;
                        // totalPractical += allotment.allotted_practical_hours;
                        return (
                            <Tile allotment={allotment} key={allotment.id} />
                        );
                    })
                )}
            </div>
            <div className=" w-1/2 h-1/2 mr-10 rounded-md m-10 p-5 shadow-[0_9px_17px_-6px_rgba(0,0,0,0.2)]">
                <CircularApexChart
                    lecture={totalLecture}
                    practical={totalPractical}
                    tutorial={totalTutorial}
                />
            </div>
        </div>
    );
};

export default Teacher;
