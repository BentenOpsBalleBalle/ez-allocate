//how to remove manually added teacher

import Client from "../helpers/Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import AssignTeacherCard from "./Subject Components/AssignTeacherCard";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Spinner, useToasts, Tag } from "@geist-ui/core";
import { CustomSearch } from "./common/CustomSearch";

const client = new Client();

const Subject = () => {
    const queryClient = useQueryClient();
    const { id } = useParams();
    const { setToast } = useToasts();

    const subjectQuery = useQuery(["subjects", +id], () =>
        client.createUrl({
            url: `api/subjects/${id}`,
            method: "GET",
            service: "allocate",
        })
    );

    const choiceQuery = useQuery(["subjects", +id, "choices"], () => {
        console.log("okokokok");
        return client.createUrl({
            url: `api/subjects/${id}/choices`,
            method: "GET",
            service: "allocate",
        });
    });

    const addTeacherMutation = useMutation(
        (teacherId) => {
            return client.createUrl({
                url: `api/subjects/${id}/choices/modify/${teacherId}/`,
                method: "POST",
                service: "allocate",
            });
        },
        {
            onSuccess: (data) => {
                queryClient.refetchQueries(["subjects", +id, "choices"], {
                    exact: true,
                });
                setToast({
                    text: "Teacher added successfully",
                    type: "success",
                });
            },
            onError: (error) => {
                setToast({
                    text: error.response.data.non_field_errors,
                    type: "error",
                });
            },
        }
    );

    const { isLoading, error } = subjectQuery;
    if (isLoading) return <div>Loading..</div>;
    if (error) return <div>Error: {error.message}</div>;
    console.log(subjectQuery.data.data);
    return (
        <div className="w-screen px-4">
            <div className="flex justify-between items-center pt-2 w-full">
                <div className="text-2xl font-bold">Assign Teachers</div>
                {/* {console.log(subjectQuery.data.data)} */}
                <div className="flex gap-x-4">
                    <Tag>
                        {subjectQuery.data.data.allotted_lecture_hours}/
                        {subjectQuery.data.data.total_lecture_hours}
                    </Tag>
                    <Tag>
                        {subjectQuery.data.data.allotted_tutorial_hours}/
                        {subjectQuery.data.data.total_tutorial_hours}
                    </Tag>
                    <Tag>
                        {subjectQuery.data.data.allotted_practical_hours}/
                        {subjectQuery.data.data.total_practical_hours}
                    </Tag>
                </div>
                <div className="mr-2 border-2 border-black rounded-[7px]">
                    <CustomSearch
                        searchFor="teachers"
                        onSelect={(value) => {
                            addTeacherMutation.mutate(value);
                        }}
                        width="250px"
                    />
                </div>
            </div>

            {choiceQuery.isLoading ? (
                <Spinner />
            ) : (
                <div className="mt-4">
                    <div className="flex gap-8 flex-wrap">
                        {choiceQuery.data.data.map((choice) => {
                            return (
                                <AssignTeacherCard
                                    key={choice.teacher.id}
                                    choice_number={choice.choice_number}
                                    teacher={choice.teacher}
                                    subjectData={subjectQuery.data.data}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
            {/* <button onClick={() => addTeacherMutation.mutate()}>
                Manual Teacher
            </button> */}
        </div>
    );
};

export default Subject;
