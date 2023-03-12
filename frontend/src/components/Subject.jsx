import Client from "../helpers/Client";
import { useQuery } from "@tanstack/react-query";
import AssignTeacherCard from "./Subject Components/AssignTeacherCard";

const client = new Client();

const Subject = () => {
    const id = 1;
    const subjectQuery = useQuery(["subjects", id], () =>
        client.createUrl({
            url: `api/subjects/${id}`,
            method: "GET",
            service: "allocate",
        })
    );

    const choiceQuery = useQuery(["subjects", id, "choices"], () =>
        client.createUrl({
            url: `api/subjects/${id}/choices`,
            method: "GET",
            service: "allocate",
        })
    );

    const { data, isLoading, error } = subjectQuery;
    if (isLoading) return <div>Loading..</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <div>Assign teachers</div>
            {choiceQuery.isLoading ? (
                <p>.?..</p>
            ) : (
                <div>
                    {/* {console.log(choiceQuery.data.data)} */}
                    <div className="flex flex-col gap-y-4">
                        {choiceQuery.data.data.map((choice) => {
                            return (
                                <AssignTeacherCard
                                    key={choice.teacher.id}
                                    choice_number={choice.choice_number}
                                    teacher={choice.teacher}
                                    subjectData={data.data}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subject;
