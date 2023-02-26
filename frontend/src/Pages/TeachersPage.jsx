import login from "../assets/login.jpg";
function TeachersPage() {
    return (
        <div>
            <div className="title text-[35px] ml-[30px] mr-[15px] font-bold">
                T E A C H E R S
            </div>
            <div className="w-72 h-72 border relative shadow-xl rounded-xl ml-10 flex flex-col justify-between">
                <img src={login} alt="login" className="h-40 w-72 rounded-xl" />
                <div className="border border-blue-300 absolute top-32 left-5 bg-blue-400 rounded-full w-16 h-16 top-10"></div>
                <div className="text-l font-sans font-bold ml-2">Name</div>
                <div className="text-l font-sans font-bold ml-2">
                    kjsdksjvhskdfhi
                </div>
            </div>
        </div>
    );
}
export default TeachersPage;
