import React, { useState, useContext } from 'react';
import { Redirect, Route } from 'react-router-dom';
import UserContext from '../context/UserContext';
import '../static/styles/registration.css';

function Register(props) {
    const [firstname, setFirstname] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [errors, setErrors] = useState("");
    const [redirect, setRedirect] = useState(false);
    const [loading, setLoading] = useState(false);
    const [, setUser] = useContext(UserContext);

    const changeField = (e, type) => {
        if(type === "name"){ setFirstname(e.target.value); }
        if(type === "surname"){ setSurname(e.target.value); }
        if(type === "email"){ setEmail(e.target.value); }
        if(type === "username"){ setUsername(e.target.value); }
        if(type === "password"){ setPassword(e.target.value); }
        if(type === "password2"){ setPassword2(e.target.value); }
    }

    const createUser = () => {
        if(password !== password2){
            setErrors("Please make sure passwords match!");
        }else{
            setErrors("");
            setLoading(true);
            fetch('/api/account/createuser', 
            {
                method: "post",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    'firstname': firstname,
                    'surname': surname,
                    'email': email,
                    'username': username,
                    'password': password
                })
            })
            .then((result) => result.json())
            .then((result) => { 
                console.log(result); 
                setLoading(false); 
                if(result.status === true){
                    console.log(`User ${result.newUser} created!`);
                    setUser(result.newUser);
                }
                setRedirect(true); 
            })
            .catch((err) => { console.log(err); });
        }
    }
    if(loading){
        return(
            <div className="registration">
                <form action="#" onSubmit={(e) => {
                    e.preventDefault();
                    createUser();
                }}>
                    <div className="loader"></div> 
                </form>
            </div>
        )
    }

    if(redirect){
        return (
            <Redirect push to="/" />
        )
    }else{
        return (
            <Route>
                <div className="registration">
                    <form className="register-form" action="#" onSubmit={(e) => {
                        e.preventDefault();
                        createUser();
                    }}>
                        <ul>
                            <li>
                                <label htmlFor="first-name">First Name:</label>
                                <input className="form-input" type="text" value={firstname} onChange={(e) => { changeField(e, "name"); }} name="first-name" pattern="^[A-Za-z0-9]+$" minLength="1" maxLength="30" required/>
                            </li>
                            <li>
                                <label htmlFor="surname">Surname:</label>
                                <input className="form-input" type="text" value={surname} onChange={(e) => { changeField(e, "surname"); }} name="surname" pattern="^[A-Za-z0-9]+$" minLength="1" maxLength="30" required/>
                            </li>
                            <li>
                                <label htmlFor="email">Email:</label>
                                <br />
                                <input className="form-input" type="email" value={email} onChange={(e) => { changeField(e, "email"); }} name="email" maxLength="100" required/>
                            </li>
                            <li>
                                <label htmlFor="user-name">Username:</label>
                                <input className="form-input" type="text" value={username} onChange={(e) => { changeField(e, "username"); }} name="user-name" placeholder="" pattern="^[A-Za-z0-9]+$" minLength="8" maxLength="30" required />
                            </li>
                            <li>
                                <label htmlFor="pass1">Password:</label>
                                <input className="form-input" id="pass1" type="password" value={password} onChange={(e) => { changeField(e, "password"); }} minLength="8" maxLength="30" required></input>
                            </li>
                            <li>
                                <label htmlFor="pass2">Confirm Password:</label>
                                <input className="form-input" id="pass2" type="password" value={password2} onChange={(e) => { changeField(e, "password2"); }} minLength="8" maxLength="30" required></input>
                            </li>
                        </ul>
                        <strong><span className="errors" >{errors}</span></strong>
                        <br />
                        <input type="submit" id="register-sub-btn" />
                    </form>
                </div>
        </Route>
        )
    }
}

export default Register;