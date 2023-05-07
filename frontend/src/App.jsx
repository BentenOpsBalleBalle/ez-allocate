import SubjectsPage from "./Pages/SubjectsPage";
import Subject from "./components/Subject";
import LoginPage from "./Pages/LoginPage";
import TeachersPage from "./Pages/TeachersPage";
import Teacher from "./components/Teacher";
import NotFoundError from "./Pages/NotFoundError";
import { Routes, Route } from "react-router-dom";
import FileHistoryPage from "./Pages/FileHistoryPage";
const App = () => {
    return (
        <div>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/subjects" element={<SubjectsPage />} />
                <Route path="/subjects/:id" element={<Subject />} />

                <Route path="/teachers" element={<TeachersPage />} />
                <Route path="/teachers/:id" element={<Teacher />} />

                <Route path="/files" element={<FileHistoryPage />} />
                <Route path="/*" element={<NotFoundError />} />
            </Routes>
        </div>
    );
};

export default App;
