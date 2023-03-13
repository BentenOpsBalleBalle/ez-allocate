import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import Client from "../helpers/Client";
import Tile from "./Tile";
import CircularApexChart from "./ApexChart";

const client = new Client();

const fetchTeacher = async (id) => {
    return await client.createUrl({
        url: `http://localhost:3000/teachers/${id}`,
        method: "GET",
    });
};

const Teacher = () => {
    const { id } = useParams();
    let renderedTiles;
    let totalLecture = 0;
    let totalTutorial = 0;
    let totalPractical = 0;

    const teacherQuery = useQuery(["teacher", id], () => fetchTeacher(id));

    return teacherQuery.isLoading ? (
        <div>loading...</div>
    ) : (
        <div className="flex w-screen h-screen items-center justify-between  ">
            <div className="card relative w-[55%] h-[86%]  rounded-md m-10 p-5 shadow-[0_9px_17px_-6px_rgba(0,0,0,0.2)]">
                <div className="text-center  text-[30px] pt-10 font-bold">
                    {teacherQuery.data?.data?.name}
                </div>
                <div className="text-[20px] pl-5 pb-5 font-semibold">
                    {console.log(teacherQuery.data?.data?.allotment)}
                    Subjects Alloted
                </div>
                {
                    (renderedTiles = teacherQuery.data?.data?.allotment.map(
                        (allotment) => {
                            totalLecture += allotment.alloted_lecture;
                            totalTutorial += allotment.alloted_tutorial;
                            totalPractical += allotment.alloted_practical;
                            return <Tile allotment={allotment} />;
                        }
                    ))
                }
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
