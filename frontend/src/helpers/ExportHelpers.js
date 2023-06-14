import { request } from "./Client";
export const downloadFileToSystem = (data, filename) => {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
};

export const handleNewFileExport = async ({ exportFor, setNewExportType, setExporting }) => {
    setExporting(true);
    try {
        const response = await request.send({
            url: `api/tasks/export${exportFor === "Teacher" ? "_teacher" : ""}_allotments_csv/create_task/`,
            method: "GET",
            service: "allocate",
        });
        const taskId = response.data.task_id;

        const interval = setInterval(async () => {
            const response = await request.send({
                url: `api/tasks/export${exportFor === "Teacher" ? "_teacher" : ""}_allotments_csv/status/${taskId}/`,
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
                setExporting(false);
                setNewExportType("success");

                downloadFileToSystem(resp.data, `${exportFor.toLowerCase()}_allottments.csv`);
            }
        }, 3000);
    } catch (err) {
        console.log(err);
        setExporting(false);
        setNewExportType("error");
    }
};
