import React, { createContext, useEffect, useState } from "react";
import { useHistory } from 'react-router-dom'
import api from '../api'
const AuthContext = createContext();
console.log("create AuthContext: " + AuthContext);

// THESE ARE ALL THE TYPES OF UPDATES TO OUR AUTH STATE THAT CAN BE PROCESSED
export const AuthActionType = {
    LOGGEDIN_USER: "REGISTER_USER",
    LOGOUT_USER: "LOGOUT_USER",
    GUEST: "GUEST",
}

function AuthContextProvider(props) {
    const [auth, setAuth] = useState({
        user: null,
        loggedIn: false
    });
    const history = useHistory();

    useEffect(() => {
        auth.getLoggedIn();
    }, []);

    const authReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case AuthActionType.LOGIN_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: (payload.user.name!=='Guest'),
                })
            }
            case AuthActionType.GUEST: {
                return setAuth({
                    user: {
                    firstName: 'Guest',
                    lastName: 'Guest',
                    name: 'Guest',
                    email: 'Guest@gmail.com'
                    },
                    loggedIn: true,
                })
            }
            case AuthActionType.LOGOUT_USER: {
                return setAuth({
                    user: null,
                    loggedIn: false,
                })
            }
            default:
                return auth;
        }
    }

    auth.logInAsGuest = function() {
        authReducer({
            type: AuthActionType.GUEST,
            payload: null
        });
    }

    auth.getLoggedIn = async function () {
        try {
            const response = await api.getLoggedIn();
            if (response.status === 200) {
                authReducer({
                    type: AuthActionType.LOGIN_USER,
                    payload: {
                        user: response.data.user
                    }
                });
            }
        }
        catch (err) {
            console.error(err);
        }
    }

    auth.registerUser = async function(userData, store) {
        try {
            const response = await api.registerUser(userData);      
            if (response.status === 200) {
                authReducer({
                    type: AuthActionType.LOGOUT_USER,
                    payload: null,
                })
                history.push("/");
                store.loadIdNamePairs();
            }
        }
        catch (err) {
            try {
                store.showAlert(err.response.data.errorMessage);
            }
            catch (error) {
                console.error(error);
            }
        }
    }

    auth.loginUser = async function(userData, store) {
        try {
            const response = await api.loginUser(userData);
            if (response.status === 200) {
                authReducer({
                    type: AuthActionType.LOGIN_USER,
                    payload: {
                        user: response.data.user
                    }
                })
                history.push("/");
                store.loadIdNamePairs();
            }
        }
        catch (err) {
            try {
                store.showAlert(err.response.data.errorMessage);
            }
            catch (error) {
                console.error(error);
            }
        }
    }

    auth.logoutUser = async function(store) {
        try {
            await api.logoutUser();
        }
        catch {}

        authReducer({
            type: AuthActionType.LOGOUT_USER,
            payload: null
        });
        store.logout();
        document.cookie = '';
        history.push("/");
    }

    return (
        <AuthContext.Provider value={{
            auth
        }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
export { AuthContextProvider };
