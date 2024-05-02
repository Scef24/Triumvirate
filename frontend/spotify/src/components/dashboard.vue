<script>
import { jwtDecode } from "jwt-decode";

export default {
    name:'Dashboard',
    data(){
    return{
        userEmail:''
    }

    },
    mounted() {

        const token = localStorage.getItem('authToken')

        if(token) {
            try{
            const decoded = jwtDecode(token)
            this.userEmail = decoded.email;
        }
        catch(error){
            console.log('Error Decoding Token: ',error)
        }
    }
    }

}
</script>

<template>
<h1>Hello Welcome to Dashboard</h1>
<p>Email: {{ userEmail }}</p>
</template>


<style>
</style>