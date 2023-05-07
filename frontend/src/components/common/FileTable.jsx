import { useQuery } from "@tanstack/react-query";
import { request } from "../../helpers/Client";
import { Table, Button, Spinner, Pagination } from "@geist-ui/core";
import { TiChevronRightOutline, TiChevronLeftOutline } from "react-icons/ti";
import { HiDocumentDownload } from "react-icons/hi";
import { useState } from "react";
import { downloadFileToSystem } from "../../helpers/ExportHelpers";
import { formatDate } from "../../helpers/generalFunctions";

export const FileTable = ({ tableDataFor }) => {
    const filesQuery = useQuery(["FileHistory"], () =>
        request.send({
            url: "api/files/",
            method: "GET",
            service: "allocate",
        })
    );
    const [page, setPage] = useState(1);
    const limit = 8;
    const endIndex = +page * +limit;
    const startIndex = endIndex - +limit;

    if (filesQuery.isLoading) return <div>Building Table...</div>;

    if (filesQuery.isError)
        return (
            <div className="text-center text-red-500">
                {filesQuery.error.message}
            </div>
        );

    const renderAction = (taskId, rowData, index) => {
        const [btnType, setBtnType] = useState("secondary");
        const [exporting, setExporting] = useState(false);
        // console.log(rowData);
        const downloadHandler = async () => {
            setExporting(true);
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
                    downloadFileToSystem(res.data, rowData.filename);
                    setBtnType("success");
                    setExporting(false);
                } else {
                    throw new Error("File not available");
                }
            } catch (e) {
                console.log(e);
                setExporting(false);
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
                {exporting ? (
                    <Spinner style={{ width: "15px" }} />
                ) : (
                    <HiDocumentDownload />
                )}
            </Button>
        );
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

    const reversedArray = dataSource.reverse();
    const totalPages = Math.ceil(reversedArray.length / limit);
    const paginatedData = reversedArray.slice(startIndex, endIndex);

    return (
        <>
            <div className="mx-auto md:w-[60%]">
                <Table data={paginatedData}>
                    <Table.Column prop="filename" label="File Name" />
                    <Table.Column prop="created_at" label="Date" />
                    <Table.Column
                        prop="id"
                        label="Download"
                        render={renderAction}
                    />
                </Table>
            </div>

            <div className="w-max  mx-auto mt-10">
                <Pagination
                    count={totalPages}
                    onChange={(newPage) => setPage(newPage)}
                >
                    <Pagination.Next>
                        <TiChevronRightOutline />
                    </Pagination.Next>
                    <Pagination.Previous>
                        <TiChevronLeftOutline />
                    </Pagination.Previous>
                </Pagination>
            </div>
        </>
    );
};
