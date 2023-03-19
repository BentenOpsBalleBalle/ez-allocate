//how to remove manually added teacher

import Client from "../helpers/Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import AssignTeacherCard from "./Subject Components/AssignTeacherCard";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Spinner, useToasts } from "@geist-ui/core";
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

    // const addTeacher = async () => {
    //     const resp = await client.createUrl({
    //         url: `api/subjects/${id}/choices/modify/${1}/`,
    //         method: "POST",
    //         service: "allocate",
    //     });
    //     console.log(resp);
    //     queryClient.invalidateQueries(["subjects", id, "choices"], {
    //         exact: true,
    //     });
    // };

    // const choiceLabels = {};
    const { isLoading, error } = subjectQuery;
    if (isLoading) return <div>Loading..</div>;
    if (error) return <div>Error: {error.message}</div>;
    return (
        <div>
            <div>Assign teachers to {subjectQuery.data.data.name}</div>
            {/* {console.log(subjectQuery.data.data)} */}
            <div>{subjectQuery.data.data.total_lecture_hours} lecture</div>
            <div>{subjectQuery.data.data.total_tutorial_hours} tutorial</div>
            <div>{subjectQuery.data.data.total_practical_hours} practical</div>
            <CustomSearch
                searchFor="teachers"
                onSelect={(value) => {
                    addTeacherMutation.mutate(value);
                }}
                width="300px"
            />
            {choiceQuery.isLoading ? (
                <Spinner />
            ) : (
                <div>
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
