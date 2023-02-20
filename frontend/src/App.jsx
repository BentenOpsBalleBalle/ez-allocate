import SubjectList from "./components/SubjectList";
import LoginPage from "./Pages/LoginPage";

const App = () => {
	return (
		<div className="w-screen h-screen">
			<LoginPage />
			<SubjectList />
		</div>
	);
};

export default App;
