//if the query is fresh then it wont be refetched when component re renders

import setColor from "../../helpers/SetColor";
import { useState, useEffect } from "react";
import getChoiceColor from "../../helpers/getChoiceColor";
import { TiDelete } from "react-icons/ti";
import Client from "../../helpers/Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import getCurrentAllotmentData from "../../helpers/getCurrentAllotmentData";
import {
    Slider,
    Button,
    Card,
    Divider,
    Avatar,
    useToasts,
    Loading,
    Tooltip,
} from "@geist-ui/core";
import { RiErrorWarningFill } from "react-icons/ri";

const client = new Client();

const AssignTeacherCard = ({ choice_number, teacher, subjectData }) => {
    const queryClient = useQueryClient();
    const { setToast } = useToasts();
    // console.log(teacher);

    const subjectMaxHours = {
        lecture: subjectData.total_lecture_hours,
        tutorial: subjectData.total_tutorial_hours,
        practical: subjectData.total_practical_hours,
    };

    // console.log(teacher.name, choice_number);

    // console.log(subjectLeftHours, "subjectLeftHours");
    const [lecture, setLecture] = useState(0);
    const [tutorial, setTutorial] = useState(0);
    const [practical, setPractical] = useState(0);

    // console.log(setColor(teacher.assigned_status));
    const teacherAllotmentsQuery = useQuery(
        ["teachers", teacher.id, "allotments"],
        () =>
            client.createUrl({
                url: `api/teachers/${teacher.id}/allotments`,
                method: "GET",
                service: "allocate",
            })
    );

    const MODES = {
        L: {
            label: "Lecture",
            state: lecture,
            setState: setLecture,
        },
        T: {
            label: "Tutorial",
            state: tutorial,
            setState: setTutorial,
        },
        P: {
            label: "Practical",
            state: practical,
            setState: setPractical,
        },
    };

    const removeTeacherMutation = useMutation(
        () =>
            client.createUrl({
                url: `api/subjects/${subjectData.id}/choices/modify/${teacher.id}/`,
                method: "DELETE",
                service: "allocate",
            }),
        {
            onSuccess: (data) => {
                queryClient.refetchQueries(
                    ["subjects", subjectData.id, "choices"],
                    { exact: true }
                );
                // const successToast = (type) =>
                setToast({
                    text: "Teacher was successfully removed",
                    type: "success",
                });

                // successToast("success");
            },

            onError: (error) => {
                setToast({
                    text: error.response.data.detail,
                    type: "error",
                });
            },
        }
    );

    const assignTeacher = useMutation(
        (allottmentData) => {
            return client.createUrl({
                url: `api/subjects/${subjectData.id}/commit_ltp/`,
                method: "POST",
                service: "allocate",
                body: allottmentData,
            });
        },
        {
            onSuccess: (data) => {
                // queryClient.refetchQueries(
                //     ["subjects", subjectData.id],
                //     {
                //         exact: true,
                //     }
                // );
                queryClient.refetchQueries(
                    ["teachers", teacher.id, "allotments"],
                    { exact: true }
                );
                queryClient.refetchQueries(
                    ["subjects", subjectData.id, "choices"],
                    { exact: true }
                );
            },
            onError: (error) => {
                console.log(error);
            },
        }
    );
    const handleAssignTeacher = async () => {
        assignTeacher.mutate({
            allotted_lecture_hours: lecture,
            allotted_tutorial_hours: tutorial,
            allotted_practical_hours: practical,
            teacher: teacher.id,
        });

        console.log("yuhuuu");
    };

    return (
        // <div
        //     className={` bg-[${getChoiceColor(
        //         choice_number
        //     )}]  w-64 p-4 rounded-lg drop-shadow-md relative`}
        // >
        <Card
            width="250px"
            style={{
                backgroundColor: getChoiceColor(choice_number),
                position: "relative",
            }}
        >
            {/* <div>{teacher.id}</div> */}
            <div className="absolute top-0 right-0 flex  z-10">
                <div className="mt-[4px] mr-1 self-center">
                    {teacherAllotmentsQuery.isLoading ||
                    teacherAllotmentsQuery.data?.data.length < 2 ? null : (
                        <div>
                            <Tooltip
                                type="warning"
                                trigger="click"
                                text={`${teacherAllotmentsQuery.data.data.length} subjects alloted`}
                            >
                                <RiErrorWarningFill className="text-black text-lg cursor-pointer" />
                            </Tooltip>
                        </div>
                    )}
                </div>
                <div className="self-center">
                    {choice_number === 0 && (
                        <TiDelete
                            onClick={() => removeTeacherMutation.mutate()}
                            className=" text-red-400  text-xl cursor-pointer"
                        />
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between gap-x-">
                {/* <img
                    className="rounded-full w-[60px] h-[60px]"
                    src={`https://api.dicebear.com/5.x/initials/svg?seed=${
                        teacher.name
                    }&backgroundColor=${setColor(teacher.assigned_status)}`}
                    alt={teacher.name}
                /> */}
                <Avatar
                    src={`https://api.dicebear.com/5.x/initials/svg?seed=${
                        teacher.name
                    }&backgroundColor=${setColor(teacher.assigned_status)}`}
                    alt={teacher.name}
                    width={2}
                    height={2}
                />
                <div>
                    <div>{teacher.name}</div>
                    {/* this is teacher total current load and not for this subject only */}
                    <div>Total {teacher.current_load}</div>
                </div>
            </div>
            {/* {console.log(buttons["L"])} */}
            <Divider h="2px" my="10px" type="success" />
            <div className="mt-2.5 flex flex-col gap-y-2">
                {teacher.preferred_mode.split("").map((mode, idx) => {
                    return (
                        <div
                            className="flex justify-between items-center"
                            key={idx}
                        >
                            <div>{MODES[mode].label}</div>
                            {teacherAllotmentsQuery.isLoading ? (
                                <Loading type="success" />
                            ) : (
                                <>
                                    {/* {console.log(
                                        teacherAllotmentsQuery.data.data
                                    )} */}
                                    <SliderComp
                                        min={0}
                                        max={
                                            subjectMaxHours[
                                                MODES[mode].label
                                                    .toString()
                                                    .toLowerCase()
                                            ]
                                        }
                                        step={
                                            MODES[mode].label === "Practical"
                                                ? 2
                                                : 1
                                        }
                                        value={MODES[mode].state}
                                        setState={MODES[mode].setState}
                                        teacherAllotmentsQuery={
                                            teacherAllotmentsQuery
                                        }
                                        subjectId={subjectData.id}
                                        mode={mode}
                                    />
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* <div
                onClick={handleAssignTeacher}
                className="mt-2 text-center bg-green-400 rounded-[5px] py-1 cursor-pointer"
            >
                <button>Assign</button>
            </div> */}
            <Button
                width="100%"
                mt="10px"
                onClick={handleAssignTeacher}
                type="success-light"
                loading={teacherAllotmentsQuery.isLoading}
            >
                Assign
            </Button>
            {/* // </div> */}
        </Card>
    );
};

const SliderComp = ({
    min,
    max,
    value,
    setState,
    step,
    teacherAllotmentsQuery,
    subjectId,
    mode,
}) => {
    const handleOnChange = (val) => {
        const newValue = parseInt(val, 10);
        setState(newValue);
    };

    useEffect(() => {
        const val = getCurrentAllotmentData(
            teacherAllotmentsQuery.data.data,
            subjectId,
            mode
        );
        setState(val);
        // console.log(val, "val");
    }, [teacherAllotmentsQuery.data.data]);

    const handleOnMouseMove = (event) => {
        const currentValue = parseInt(event.target.value, 10);
        event.target.title = currentValue;
    };
    return (
        <>
            <Slider
                initialValue={value}
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={handleOnChange}
                width="100px"
                disabled={min == max}
            />
        </>
    );
};

export default AssignTeacherCard;
