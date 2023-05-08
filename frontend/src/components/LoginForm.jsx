import { useForm } from "react-hook-form";
import { request } from "../helpers/Client";
import { useNavigate } from "react-router-dom";
function LoginForm() {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();
    const onSubmit = async (data) => {
        const res = await request.send({
            url: "auth/signin",
            method: "POST",
            body: {
                email: data.email,
                password: data.password,
            },
            service: "auth",
        });
        request.setToken(res.data.token);
        localStorage.setItem("token", res.data.token);
        navigate("/subjects");
    };

    return (
        <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
            <input
                placeholder="Enter Email"
                name="email"
                {...register("email", {
                    required: true,
                    pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                })}
                className="border border-gray-400 rounded-full w-80 py-3 px-3 mb-2"
            />

            {errors.email && (
                <p className="text-red-400">Please enter valid email.</p>
            )}

            <input
                placeholder="Enter Password"
                {...register("password", {
                    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                })}
                className="border border-gray-400 rounded-full w-80 py-3 px-3"
            />
            {errors.password && (
                <p className="text-xs text-red-400">
                    Minimum eight characters, at least one letter and one number
                </p>
            )}

            <button
                className="font-sans font-bold text-white text-2xl border bg-blue-700 rounded-full w-44 mt-4  py-2"
                type="submit"
            >
                Login
            </button>
        </form>
    );
}

export default LoginForm;
