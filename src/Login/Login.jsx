import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

const Login = () => {
    return ( 

    <center>
    <div className="card bg-base-100 w-96 shadow-sm mt-40">
            <div className="card-body">
            <h2 className="card-title"> Login</h2>
            <input type="text" placeholder="Username" className="input" />
            <input type="Password" placeholder="Password" className="input mt-2" />
            <div className="card-actions justify-end">

            
            <button className="btn 
            btn-primary">Login</button>
            </div>
        </div>
    </div>
    </center>
     );
}
 
export default Login;