import { useQuery } from "@tanstack/react-query";
import { request } from "../helpers/Client";
import { Tabs, Table, Button } from "@geist-ui/core";
import { FaBook } from "react-icons/fa";
import { BsFilePersonFill } from "react-icons/bs";
import { HiDocumentDownload } from "react-icons/hi";
import { useState } from "react";

const downloadFile = (data, filename) => {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
};

const handleExport = async (exportFor, setNewExportType) => {
    try {
        const response = await request.send({
            url: `api/tasks/export${
                exportFor === "Teacher" ? "_teacher" : ""
            }_allotments_csv/create_task/`,
            method: "GET",
            service: "allocate",
        });
        const taskId = response.data.task_id;

        const interval = setInterval(async () => {
            const response = await request.send({
                url: `api/tasks/export${
                    exportFor === "Teacher" ? "_teacher" : ""
                }_allotments_csv/status/${taskId}/`,
                method: "GET",
                service: "allocate",
            });
            if (response.data.status === "SUCCESS") {
                clearInterval(interval);
                const resp = await request.send({
                    url: `api/tasks/export${
                        exportFor === "Teacher" ? "_teacher" : ""
                    }_allotments_csv/results/${taskId}/`,
                    method: "GET",
                    service: "allocate",
                });
                setNewExportType("success");
                downloadFile(
                    resp.data,
                    `${exportFor.toLowerCase()}_allottments.csv`
                );
            }
        }, 3000);
    } catch (err) {
        console.log(err);
        setNewExportType("error");
    }
};

const FileHistoryPage = () => {
    const [perspective, setPerspective] = useState("Subject");
    const [newExportType, setNewExportType] = useState("secondary");
    return (
        <div className="pt-4">
            <div className="flex justify-around items-center">
                <div className="text-center font-bold text-[20px]">
                    Export Files
                </div>
                <Button
                    auto
                    type={newExportType}
                    scale={1 / 2}
                    font="12px"
                    onClick={() => {
                        handleExport(perspective, setNewExportType);
                        setNewExportType("secondary");
                    }}
                >
                    <div>Create {perspective} Export</div>
                    <HiDocumentDownload />
                </Button>
            </div>
            <Tabs
                initialValue="1"
                align="center"
                onChange={(val) => {
                    if (val === "1") setPerspective("Subject");
                    if (val === "2") setPerspective("Teacher");
                }}
            >
                <Tabs.Item
                    label={
                        <>
                            <FaBook /> Subject
                        </>
                    }
                    value="1"
                >
                    <FileTable tableDataFor="allotments" />
                </Tabs.Item>
                <Tabs.Item
                    label={
                        <>
                            <BsFilePersonFill /> Teacher
                        </>
                    }
                    value="2"
                >
                    <FileTable tableDataFor="teacher" />
                </Tabs.Item>
            </Tabs>
        </div>
    );
};

const FileTable = ({ tableDataFor }) => {
    const filesQuery = useQuery(["FileHistory"], () =>
        request.send({
            url: "api/files/",
            method: "GET",
            service: "allocate",
        })
    );

    if (filesQuery.isLoading) return <div>Building Table...</div>;

    if (filesQuery.isError)
        return (
            <div className="text-center text-red-500">
                {filesQuery.error.message}
            </div>
        );

    const renderAction = (taskId, rowData, index) => {
        const [btnType, setBtnType] = useState("secondary");
        // console.log(rowData);
        const downloadHandler = async () => {
            try {
                const res = await request.send({
                    url: `api/tasks/export${
                        rowData.filename.split("_")[0] === "teacher"
                            ? "_teacher"
                            : ""
                    }_allotments_csv/results/${taskId}/`,
                    method: "GET",
                    service: "allocate",
                });
                if (res.status === 200) {
                    downloadFile(res.data, rowData.filename);
                    setBtnType("success");
                } else {
                    throw new Error("File not available");
                }
            } catch (e) {
                console.log(e);
                setBtnType("error");
            }
        };
        return (
            <Button
                auto
                type={btnType}
                scale={1 / 4}
                font="12px"
                onClick={downloadHandler}
            >
                <HiDocumentDownload />
            </Button>
        );
    };
    const formatDate = (inputString) => {
        const date = new Date(inputString);
        const options = { day: "numeric", month: "long", year: "numeric" };
        return date.toLocaleDateString("en-US", options);
    };

    const dataSource = filesQuery.data.data
        .filter((file) => {
            if (file?.filename?.split("_")[0] === tableDataFor) {
                return true;
            }
        })
        .map((file) => {
            return {
                id: file.id,
                filename:
                    tableDataFor === "teacher"
                        ? file.filename
                        : "subject_allotments.csv",
                created_at: formatDate(file.created_at),
            };
        });

    return (
        <div className="mx-auto md:w-[60%]">
            <Table data={dataSource}>
                <Table.Column prop="filename" label="File Name" />
                <Table.Column prop="created_at" label="Date" />
                <Table.Column
                    prop="id"
                    label="Download"
                    render={renderAction}
                />
            </Table>
        </div>
    );
};

export default FileHistoryPage;
