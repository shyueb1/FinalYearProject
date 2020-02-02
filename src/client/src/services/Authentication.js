import Cookies from 'universal-cookie';
const cookie = new Cookies();


class Authentication{

    async initAuth(){
        const auth = new Authentication();
        await auth.loadAuth();
        return auth;
    }

    async loadAuth(){
        const authInfo = await this.verifyToken();
        this.setUser(authInfo.user);
        this.setAuthenticated(authInfo.authorized);
    }

    getAuthUser(){
        console.log("Getting user!");
        return this.user;
    }

    getUser(){
        return cookie.get("user");
    }
    
    setUser(user){
        this.user = user;
    }

    isAuthenticated(){
        return this.authenticated;
    }

    setAuthenticated(authenticated){
        this.authenticated = authenticated;
    }

    logout(){
        cookie.remove("token");
        cookie.remove("user");
    }

    login(user, token){
        const now = Date.now();
        const hour = 60*60*1000;
        cookie.set("user", user, {expires: new Date(now+hour)});
        cookie.set("token", token, {expires: new Date(now+hour)});
    }

    getToken(){
        return cookie.get("token");
    }

    async verifyToken(){
        const token = this.getToken();
        if(token === null || token === undefined || token === ""){
            return false;
        }
        try{
            const response = await fetch('/api/account/authorizeuser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': token
                }
            });
            const jsonResponse = await response.json();
            if(jsonResponse.authorized === false){
                this.logout();
                window.location.replace('/login');
            }
            console.log(jsonResponse);
            return jsonResponse;
        }catch(rejectedValue){
            return false;
        }
        
    }
}

export default Authentication = new Authentication();