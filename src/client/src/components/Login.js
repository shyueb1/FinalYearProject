import React, { useState, useContext } from 'react';
import { Redirect, Route, Link } from 'react-router-dom';
import '../static/styles/login.css';
import Button from './Button';
import googleLogo from '../static/images/search.svg';
import Horizontal from './Horizontal';
import UserContext from '../context/UserContext';
import Cookies from 'universal-cookie';
import Authentication from '../services/Authentication';

function Login(props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [redirect, setRedirect] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState("");
    const [user, setUser] = useContext(UserContext);
    const cookies = new Cookies();

    const login = () => {
        setLoading(true);
        fetch('/api/account/login', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                'email': email,
                'password': password
            })
        })
        .then((response) => response.json())
        .then((response) => {
            console.log(response);
            setLoading(false);
            if(response.error === false){
                setRedirect(true);
                setUser(response.user);
                Authentication.logout();
                Authentication.login(response.user, response.token);
            }else{
                setErrors("Incorrect login credentials.");
            }
        })
        .catch((err) => console.log(err));
    }

    const changeField = (e, type) => {
        if(type === "email"){ setEmail(e.target.value);}
        if(type === "password"){ setPassword(e.target.value);}
    }

    if(loading){
        return(
            <div className="login-container">
                {/* <div className="login"> */}
                    <div className="loader"></div> 
                {/* </div> */}
            </div>
        )
    }

    if(redirect){
        return (
            <Redirect push to="/" />
        )
    }

    if(user){
        return <Redirect to="/" />
    }

    return (
        <Route>
            <div className="login-container">
                <div className="login">
                    <div className="login-header">
                        <h1>Login</h1>
                        {/* <Link to="/register" ><Button className="outline-blue" name="Sign Up"/></Link> */}
                    </div>
                    <Horizontal />
                    {/* <div className="login-form-container"> */}
                        <form className="login-form" onSubmit={(e) => {
                            e.preventDefault();
                            login();
                        }}>
                            <label htmlFor="email">Email</label>
                            <input name="email" value={email}  onChange={(e) => { changeField(e, "email") }} type="text" />
                            <label htmlFor="password">Password</label>
                            <input name="password" value={password} onChange={(e) => { changeField(e, "password") }} type="password" />
                            <input className="login-btn" value="Login" type="submit"/>
                        </form>
                    {/* </div> */}
                    <br />
                    <br />
                    <Link to="/register"><p>New? Click here to create an account.</p></Link>
                    <div className="form-error">{errors}</div>
                    <Horizontal />
                    <div className="alt-login">
                        <a href="!#"><p>Login via Google <img src={googleLogo} alt="google logo"></img></p></a>
                        {/* <div>Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div> */}
                    </div>
                </div>
            </div>
        </Route>
    )
}

export default Login;