import SubjectsPage from "./Pages/SubjectsPage";
import Subject from "./components/Subject";
import LoginPage from "./Pages/LoginPage";
import TeachersPage from "./Pages/TeachersPage";
import Teacher from "./components/Teacher";
import NotFoundError from "./Pages/NotFoundError";
import { Routes, Route } from "react-router-dom";
const App = () => {
    return (
        <div>
            <Routes>
                <Route path="/subjects" element={<SubjectsPage />} />
                <Route path="/subjects/:id" element={<Subject />} />

                <Route path="/teachers" element={<TeachersPage />} />
                <Route path="/teachers/:id" element={<Teacher />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/*" element={<NotFoundError />} />
            </Routes>
        </div>
    );
};

export default App;
