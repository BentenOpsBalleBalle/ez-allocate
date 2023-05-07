import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const NotFoundError = () => {
    const navigate = useNavigate();
    return (
        <div className="mt-28">
            <Result
                status="403"
                title="403"
                subTitle="Sorry, you are not authorized to access this page."
                extra={
                    <Button
                        onClick={() => navigate("/login")}
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

export default NotFoundError;
