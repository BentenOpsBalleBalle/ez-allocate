import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AutoComplete, Text } from "@geist-ui/core";
import setColor from "../../helpers/setColor.js";

import { request } from "../../helpers/Client.js";
export const CustomSearch = ({ searchFor, onSelect, width }) => {
    const subjectOption = (courseName, courseCode, status, id) => (
        <AutoComplete.Option value={id}>
            <div
                style={{ backgroundColor: `#${setColor(status)}` }}
                className="w-full p-1.5 my-1 rounded-md flex justify-between items-center"
            >
                <Text b my="5px">
                    {courseCode} - {courseName}
                </Text>
                {/* <Button
                    auto
                    type="success-light"
                    onClick={() => customOnSelect(id)}
                    height="20px"
                >
                    Go
                </Button> */}
            </div>
        </AutoComplete.Option>
    );

    const teacherOption = (name, email, status, id) => (
        <AutoComplete.Option value={id}>
            <div
                style={{ backgroundColor: `#${setColor(status)}` }}
                className="w-full p-1.5 my-1 rounded-md "
            >
                <div className="flex flex-col">
                    <div className="text-[14px] font-medium">{name}</div>
                    <div className="text-[10px]">{email}</div>
                </div>
                {/* <Button type="success-light" onClick={() => customOnSelect(id)}>
                    Add
                </Button> */}
            </div>
        </AutoComplete.Option>
    );
    const [options, setOptions] = useState();
    const [searching, setSearching] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const searchQuery = useQuery(["search", searchFor, searchValue], () =>
        request.send({
            url: `api/search/${searchFor}/?q=${searchValue}`,
            method: "GET",
            service: "allocate",
        })
    );

    const searchHandler = (currentValue) => {
        if (!currentValue) return setOptions([]);
        setSearchValue(currentValue);
        if (searchQuery.isLoading) {
            setSearching(true);
        } else {
            setSearching(false);
            console.log(searchQuery.data.data);
            if (searchFor === "subjects") {
                const customOptions = searchQuery.data.data.map((query) =>
                    subjectOption(
                        query.name,
                        query.course_code,
                        query.allotment_status,
                        query.id
                    )
                );
                setOptions(customOptions);
            } else if (searchFor === "teachers") {
                const customOptions = searchQuery.data.data.map((query) =>
                    teacherOption(
                        query.name,
                        query.email,
                        query.assigned_status,
                        query.id
                    )
                );
                setOptions(customOptions);
            }
        }

        // setOptions(relatedOptions);
    };

    const customOnSelect = (value) => {
        setSearchValue("");
        onSelect(value);
    };
    return (
        <AutoComplete
            options={options}
            value={searchValue}
            placeholder="Enter here"
            onSearch={searchHandler}
            searching={searching}
            width={width}
            onSelect={customOnSelect}
            dropdownClassName="my-dropdown"
            style={{
                maxHeight: "200px",
                overflowY: "auto",
            }}
        >
            <AutoComplete.Empty>
                <span className="text-red-300">No result</span>
            </AutoComplete.Empty>
        </AutoComplete>
    );
};
