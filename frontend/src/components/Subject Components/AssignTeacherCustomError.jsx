import { Modal } from "@geist-ui/core";
import { useState } from "react";
const AssignTeacherCustomError = ({ error, resetErrorBoundary }) => {
    const errorField = Object.keys(error.response.data)[0];

    const [state, setState] = useState(true);
    const closeHandler = (event) => {
        setState(false);
        console.log("closed");
        resetErrorBoundary();
    };
    return (
        <Modal id="error-modal" visible={state} onClose={closeHandler}>
            <Modal.Title>Error</Modal.Title>
            <Modal.Content>
                <p>{error.response.data[errorField]}</p>
            </Modal.Content>
        </Modal>
    );
};

export default AssignTeacherCustomError;
