import { Spinner } from "@geist-ui/core";
export function Pagination({ setPage, page, query }) {
    return (
        <div className="w-screen flex items-center justify-around mt-6 ">
            <button
                className="disabled:bg-red-600 disabled:cursor-not-allowed bg-black text-white px-4 py-2 rounded-md cursor-pointer"
                onClick={() => {
                    setPage(page - 1);
                }}
                disabled={page === 1}
            >
                Prev
            </button>
            <div className="flex gap-x-2 items-center">
                Page {page} {query.isFetching ? <Spinner /> : ""}
            </div>
            <button
                className="bg-black text-white px-4 py-2 rounded-md cursor-pointer disabled:bg-red-600 disabled:cursor-not-allowed"
                onClick={() => {
                    if (query.data?.data?.length !== 0) {
                        setPage(page + 1);
                    }
                }}
                disabled={
                    query.data?.data?.length === 0 || query.isPreviousData
                }
            >
                Next
            </button>
        </div>
    );
}
