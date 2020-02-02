import React, { useState, useEffect, useContext } from 'react';
import { Route } from 'react-router-dom';
import Loading from '../components/Loading';
import Authentication from '../services/Authentication';
import UserContext from '../context/UserContext';

function ProtectedRoute(props) {
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, ] = useContext(UserContext);

    const authenticate = async () => {
        setLoading(true);
        const auth = await Authentication.initAuth();
        return auth.getAuthUser();
    }

    useEffect(() => {
        const authUser = authenticate();
            authUser.then((authorised) => {
                setLoading(false);
                if(authorised){
                    if(user === authorised.username){
                        setAuthenticated(true);
                    }else{
                        setAuthenticated(false);
                        console.log("Username forged not matching token.");
                    }
                }else{
                    setAuthenticated(false);
                    Authentication.logout();
                    console.log("User not authorised to list item.");
                }
            });
        return () => {
        };
    }, [user]);

    if(loading){
        return <Loading />;
    }

    if(authenticated){
        return (
            <Route exact path={props.path} component={props.component}></Route>
        );
    }
    
    return (
        <h1 className="protected">You must be logged in to view this page.</h1>
    );
}

export default ProtectedRoute;
