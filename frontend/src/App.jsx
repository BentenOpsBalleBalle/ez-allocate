import SubjectList from "./components/SubjectList";
import LoginPage from "./Pages/LoginPage";
import TeachersPage from "./Pages/TeachersPage";
import Teacher from "./components/Teacher";
import { Routes, Route } from "react-router-dom";
const App = () => {
    console.log("hello");
    const en = process.env.REACT_APP_AUTH_URL;
    console.log(en, "enviroment variable");
    return (
        <div className="w-screen h-screen">
            <Routes>
                <Route path="/subjects" element={<SubjectList />} />

                <Route path="/teachers" element={<TeachersPage />} />
                <Route path="/teachers/:id" element={<Teacher />} />
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </div>
    );
};

export default App;
