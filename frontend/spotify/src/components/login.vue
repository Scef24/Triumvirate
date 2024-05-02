<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="loginUser">
      <div>
        <label for="email">Email:</label>
        <input v-model="user.email" type="email" id="email" required>
      </div>
      <div>
        <label for="password">Password:</label>
        <input v-model="user.password" type="password" id="password" required>
      </div>
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Login',
  data() {
    return {
      user: {
        email: '',
        password: ''
      }
    };
  },
  methods: {
    async loginUser() {
      try {
        const response = await axios.post('http://localhost:3000/login', this.user);
        console.log('Token:', response.data.token);
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userEmail',response.data.email);
        this.$router.push('/dashboard');
      } catch (error) {
        console.error('Error logging in:', error.response.data.error);
      }
    }
  }
}
</script>
