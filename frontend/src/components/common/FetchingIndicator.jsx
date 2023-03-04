import { useIsFetching } from "@tanstack/react-query";
import { FaSpinner } from "react-icons/fa";

export default function FetchingIndicator() {
    const isFetching = useIsFetching(); //checks all queries if empty
    if (!isFetching) return null;
    return <FaSpinner className="animate-spin w-[50px]" />;
}
