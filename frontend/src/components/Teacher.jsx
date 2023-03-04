import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import Client from "../helpers/Client";

const client = new Client();

const fetchTeacher = async (id) => {
    return await client.createUrl({
        url: `http://localhost:3000/teachers/${id}`,
        method: "GET",
    });
};

const Teacher = () => {
    const { id } = useParams();
    const teacherQuery = useQuery(["teacher", id], () => fetchTeacher(id));
    if (teacherQuery.isError) {
        return <p>Error: {teacherQuery.error.message}</p>;
    }
    if (teacherQuery.isLoading) {
        return <p>Loading...</p>;
    }
    const teacher = teacherQuery.data.data;
    console.log(teacher);

    return (
        <div className="flex w-screen">
            <div className=" w-[15%] h-screen bg-[#002254] rounded-r-lg">
                <div className="w-full">
                    <div className="text-center flex-col gap-y-10 mt-20">
                        {/* <img
                    src={teacher.profilePicture}
                    alt={teacher.name}
                    className="rounded-full h-32 w-32 bg-[#002254] m-auto"
                /> */}
                        <div className="text-center text-white text-[30px] pt-10 font-bold">
                            name
                        </div>
                        <div className="text-center text-white text-sm pt-2 ">
                            email
                        </div>
                    </div>
                </div>
            </div>

            <div className="card relative w-[85%]  rounded-md m-10 p-5 shadow-[0_9px_17px_-6px_rgba(0,0,0,0.2)] ">
                <div className="text-[20px] pl-5 pb-5 font-semibold">
                    Subjects Alloted
                </div>
            </div>
        </div>
    );
};

export default Teacher;
