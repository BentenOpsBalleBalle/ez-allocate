import { useQuery } from "@tanstack/react-query";
import Client from "../helpers/Client";
const client = new Client();

const getSubjects = async () => {
	return await client.createUrl({
		url: "http://localhost:3000/test",
		method: "GET",
	});
};
function SubjectList() {
	const subjectsQuery = useQuery(["subjects"], getSubjects);

	if (subjectsQuery.isError) {
		return <p>Error: {subjectsQuery.error.message}</p>;
	}

  return (
    <div>
      <div className="flex justify-between items-end mb-[15px] mt-[10px]  ">
        <div className="flex gap-x-4">
          <div className="title text-[35px] ml-[30px] mr-[15px] font-bold">
            S U B J E C T S
          </div>
          <div className="flex gap-x-2 items-end">
            <div className="w-5 h-5 bg-red-400 rounded-sm" />
            <div>No teachers available</div>
          </div>
          <div className="flex gap-x-2 items-end">
            <div className="w-5 h-5 bg-green-400 rounded-sm" />
            <div>Subject Alloted</div>
          </div>
          <div className="flex gap-x-2 items-end">
            <div className="w-5 h-5 bg-yellow-400 rounded-sm" />
            <div>Subject to be alloted</div>
          </div>
        </div>
        <SearchBar />
        <div className="mr-10 border border-blue-300 bg-blue-700 text-white font-mono text-xl font-bold rounded-lg px-3 py-1 cursor-pointer">
          Teachers
        </div>
      </div>

      {subjectsQuery.isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="flex mt-6">
          {subjectsQuery.data.data.map((subject) => (
            <SubjectCard
              key={subject.id}
              name={subject.name}
              allotmentStatus={subject.allotmentStatus}
              id={subject.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SubjectList;
