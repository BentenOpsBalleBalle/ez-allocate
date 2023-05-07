import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const NotFoundError = () => {
    const navigate = useNavigate();
    return (
        <div className="mt-28">
            <Result
                status="404"
                title="404"
                subTitle="Sorry, the page you visited does not exist."
                extra={
                    <Button
                        onClick={() => navigate("/subjects")}
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
