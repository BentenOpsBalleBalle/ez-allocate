import { Button } from "@geist-ui/core";
import { CiExport } from "react-icons/ci";
import { useState } from "react";
import { request } from "../helpers/Client";
import { useNavigate } from "react-router-dom";

const ExportComp = () => {
    const navigate = useNavigate();
    // const [exporting, setExporting] = useState(false);
    // const downloadFile = (data, filename) => {
    //     const url = window.URL.createObjectURL(new Blob([data]));
    //     const link = document.createElement("a");
    //     link.href = url;
    //     link.setAttribute("download", filename);
    //     document.body.appendChild(link);
    //     link.click();
    //     link.remove();
    // };

    // const handleExport = async () => {
    //     setExporting(true);
    //     try {
    //         const response = await request.send({
    //             url: "api/tasks/export_allotments_csv/create_task/",
    //             method: "GET",
    //             service: "allocate",
    //         });
    //         console.log(response, "response1");
    //         const taskId = response.data.task_id;

    //         const interval = setInterval(async () => {
    //             const response = await request.send({
    //                 url: `api/tasks/export_allotments_csv/status/${taskId}/`,
    //                 method: "GET",
    //                 service: "allocate",
    //             });
    //             if (response.data.status === "SUCCESS") {
    //                 setExporting(false);
    //                 clearInterval(interval);
    //                 const resp = await request.send({
    //                     url: `api/tasks/export_allotments_csv/results/${taskId}/`,
    //                     method: "GET",
    //                     service: "allocate",
    //                 });
    //                 console.log(resp);
    //                 downloadFile(resp.data, "subject_allottments.csv");
    //             }
    //         }, 1000);
    //     } catch (err) {
    //         console.log(err);
    //         setExporting(false);
    //     }
    // };

    // const handleTeacherExport = async () => {
    //     setExporting(true);
    //     try {
    //         const response = await request.send({
    //             url: "api/tasks/export_teacher_allotments_csv/create_task/",
    //             method: "GET",
    //             service: "allocate",
    //         });
    //         console.log(response, "response1");
    //         const taskId = response.data.task_id;

    //         const tInterval = setInterval(async () => {
    //             const response = await request.send({
    //                 url: `api/tasks/export_teacher_allotments_csv/status/${taskId}/`,
    //                 method: "GET",
    //                 service: "allocate",
    //             });
    //             if (response.data.status === "SUCCESS") {
    //                 setExporting(false);
    //                 clearInterval(tInterval);
    //                 const resp = await request.send({
    //                     url: `api/tasks/export_teacher_allotments_csv/results/${taskId}/`,
    //                     method: "GET",
    //                     service: "allocate",
    //                 });
    //                 console.log(resp);
    //                 downloadFile(resp.data, "teacher_allottments.csv");
    //             }
    //         }, 1000);
    //     } catch (err) {
    //         console.log(err);
    //         setExporting(false);
    //     }
    // };
    return (
        <div>
            <Button onClick={() => navigate("/files")} auto type="secondary">
                <CiExport />
            </Button>
        </div>
    );
};

export default ExportComp;
