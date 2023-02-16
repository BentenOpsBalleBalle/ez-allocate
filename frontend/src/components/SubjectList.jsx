import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import SubjectCard from "./SubjectCard";

const getSubjects = async () => {
  return await axios.get("http://localhost:3000/test");
};

function SubjectList() {
  const subjectsQuery = useQuery(["subjects"], getSubjects);

  return (
    <div>
      <div className="flex gap-x-4 pl-2 mt-[20px] mb-[10px] ">
        <div className="title text-[35px] ml-[30px] mr-[15px] font-bold">
          S U B J E C T S
        </div>
        <div className="flex gap-x-2 items-center">
          <div className="w-5 h-5 bg-red-400 rounded-sm" />
          <div>No teachers available</div>
        </div>
        <div className="flex gap-x-2 items-center">
          <div class="w-5 h-5 bg-green-400 rounded-sm" />
          <div>Subject Alloted</div>
        </div>
        <div className="flex gap-x-2 items-center">
          <div className="w-5 h-5 bg-yellow-400 rounded-sm" />
          <div>Subject to be alloted</div>
        </div>
      </div>
      {subjectsQuery.isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="flex">
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
