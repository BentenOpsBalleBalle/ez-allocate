import SubjectsPage from "./Pages/SubjectsPage";
import Subject from "./components/Subject";
import LoginPage from "./Pages/LoginPage";
import TeachersPage from "./Pages/TeachersPage";
import Teacher from "./components/Teacher";
import NotFoundError from "./Pages/NotFoundError";
import { Routes, Route } from "react-router-dom";
import FileHistoryPage from "./Pages/FileHistoryPage";
import { request } from "./helpers/Client";
import { useLocation } from "react-router-dom";
import NotAuthorizedError from "./Pages/NotAuthorizedError";

const App = () => {
    const location = useLocation();
    console.log(location);
    if (localStorage.getItem("token")) {
        request.setToken(localStorage.getItem("token"));
        // navigate(location.pathname);
        if (location.pathname === "/") {
            window.location.assign("/subjects");
        }
    }
    return (
        <div>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/subjects" element={<SubjectsPage />} />
                <Route path="/subjects/:id" element={<Subject />} />

                <Route path="/teachers" element={<TeachersPage />} />
                <Route path="/teachers/:id" element={<Teacher />} />

                <Route path="/files" element={<FileHistoryPage />} />
                <Route path="/auth-error" element={<NotAuthorizedError />} />

                <Route path="/*" element={<NotFoundError />} />
            </Routes>
        </div>
    );
};

export default App;
