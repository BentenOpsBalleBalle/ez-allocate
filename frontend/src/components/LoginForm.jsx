import { useForm } from "react-hook-form";
import axios from "axios";
import Client from "../helpers/Client";

function LoginForm() {
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm();
	const onSubmit = async (data) => {
		const response = await axios.post("http://localhost:3000/auth/signin", {
			email: data.email,
			password: data.password,
		});
		const client = new Client();
		client.setToken(response.data.token);

		const test = await client.createUrl({
			url: "http://localhost:3000/protected",
			method: "GET",
			headers: { "content-type": "application/json" },
			body: {
				email: "wfwfwf",
				password: "wfwfwf",
			},
		});
		console.log(test);

		// console.log(response);
		// axios.defaults.headers.common[
		// 	"Authorization"
		// ] = `Bearer ${response.data.token}`;

		// const res = await axios.get("http://localhost:3000/protected");
		// console.log(res);
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
