import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const NotAuthorizedError = () => {
    const navigate = useNavigate();
    return (
        <div className="mt-28">
            <Result
                status="403"
                title="403"
                subTitle="Sorry, you are not authorized to access this page."
                extra={
                    <Button
                        onClick={() => navigate("/")}
                        type="primary"
                        style={{ backgroundColor: "#1677ff" }}
                    >
                        Back Home
                    </Button>
                }
            />
        </div>
    );
};

export default NotAuthorizedError;
