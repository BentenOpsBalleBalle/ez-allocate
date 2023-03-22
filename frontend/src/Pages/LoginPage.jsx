import LoginForm from "../components/LoginForm";

function LoginPage() {
    return (
        <div className="flex">
            <div className="bg-[#f4f1ea] h-screen relative w-1/2 ">
                <div className="absolute top-8 font-bold text-4xl left-12 font-serif">
                    <span className="text-blue-800 font-bold text-4xl ">
                        Ez-
                    </span>
                    Allocate
                </div>
                <img src="/login.jpg" alt="login" className="absolute top-44" />
            </div>
            <div className="relative h-screen w-1/2">
                <div className="absolute top-80 left-[50%] -translate-y-2/4 -translate-x-2/4">
                    <div className="font-bold text-4xl text-center font-sans mb-4">
                        Login
                    </div>
                    <div className="font-sans text-gray-400 mb-4">
                        Enter your credentials to access the platform
                    </div>
                    <div className="">
                        <LoginForm />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
