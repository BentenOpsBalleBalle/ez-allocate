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
			{subjectsQuery.isLoading ? (
				<p>Loading...</p>
			) : (
				<ul>
					{subjectsQuery.data.data.map((subject) => (
						<li key={subject.id}>{subject.name}</li>
					))}
				</ul>
			)}
			{/* <LoginForm /> */}
		</div>
	);
}

export default SubjectList;
