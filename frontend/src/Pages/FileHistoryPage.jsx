import { Tabs, Button, Spinner } from "@geist-ui/core";
import { FaBook } from "react-icons/fa";
import { BsFilePersonFill } from "react-icons/bs";
import { HiDocumentDownload } from "react-icons/hi";
import { useState } from "react";
import { handleNewFileExport } from "../helpers/ExportHelpers";
import { FileTable } from "../components/common/FileTable";

const FileHistoryPage = () => {
    const [perspective, setPerspective] = useState("Subject");
    const [newExportType, setNewExportType] = useState("secondary");
    const [exporting, setExporting] = useState(false);
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
                        handleNewFileExport({
                            exportFor: perspective,
                            setNewExportType: setNewExportType,
                            setExporting: setExporting,
                        });
                        setNewExportType("secondary");
                    }}
                >
                    <div className="flex gap-x-2 items-center">
                        <div>Create {perspective} Export</div>
                        {exporting ? (
                            <Spinner style={{ width: "15px" }} />
                        ) : (
                            <HiDocumentDownload />
                        )}
                    </div>
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

export default FileHistoryPage;
