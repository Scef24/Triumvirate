<script>
import { jwtDecode } from "jwt-decode"; // Correct import for default export

export default {
  name: 'Dashboard',
  data() {
    return {
      userEmail: '',
      ws: null,
      messages: [],
      newMessage: '',
      searchQuery: '',  // For storing the search input
    searchResults: [],  // For storing search results
    searchType: 'track',
    featuredPlaylists: [],
    };
  },
  mounted() {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        this.userEmail = decoded.email;
        this.setUpWebSocket()
      } catch (error) {
        console.error('Error Decoding Token:', error);
      }
    } else {
      console.error('No token found in localStorage');
    }
  },created(){
    this.fetchFeaturedPlaylists();
    this.fetchMessages()
  },
  methods: {
    setUpWebSocket() {
        this.ws = new WebSocket('ws://localhost:3001');
        this.ws.onmessage =(event)=> {
            const newMessage = JSON.parse(event.data)
            this.messages.push({
                email:newMessage.email,
                text:newMessage.message
            })
        }
    },async fetchMessages() {
        const response = await(fetch('http://localhost:3001/api/messages'))
        const data = await response.json()
         this.messages = data;
    },sendMessage() {
    console.log('Function is Triggered');
    if(this.newMessage.trim()) {
        fetch('http://localhost:3001/api/messages',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                email: this.userEmail,
                message: this.newMessage
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server response indicates failure to save the message');
            }
            return response.json();
        })
        .then(data => {
            if (data.message === 'Message saved') {
                this.messages.push({
                    email: this.userEmail,
                    text: this.newMessage
                });
                
                this.newMessage = ''; // Clear input field
            } else {
                console.error('Unexpected response from server:', data);
            }
        })
        .catch(error => {
            console.error('Error sending a message:', error);
        });
    }
}, async searchSpotify() {
    if (!this.searchQuery.trim()) return;

    const url = `http://localhost:3002/search?query=${encodeURIComponent(this.searchQuery)}&type=${this.searchType}`;
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        this.searchResults = data[this.searchType + 's'].items;  // Parsing depends on the type
      } else {
        throw new Error('Failed to fetch search results');
      }
    } catch (error) {
      console.error('Error fetching Spotify data:', error);
      this.searchResults = [];
    }
  },async fetchFeaturedPlaylists() {
  try {
    const response = await fetch('http://localhost:3002/featuredPlaylists');
    if (!response.ok) {
      throw new Error(`Failed to fetch featured playlists: ${response.statusText}`);
    }
    const data = await response.json();
    this.featuredPlaylists = data.playlists.items;
  } catch (error) {
    console.error(error);
    this.featuredPlaylists = [];
  }
},
}}
</script>

<template>
    <div>
      <h1>Hello, Welcome to Dashboard</h1>
      <p>Email: {{ userEmail }}</p>
        
      <ul class="featured-playlists">
  <li v-for="(playlist, index) in featuredPlaylists" :key="index">
    <strong>{{ playlist.name }}</strong> by {{ playlist.owner.display_name }}
    <!-- Embed Spotify player if the playlist has a Spotify URI -->
    <div v-if="playlist.external_urls.spotify">
      <iframe
        :src="`https://open.spotify.com/embed/playlist/${playlist.id}?utm_source=generator`"
        style="border-radius:12px"
        width="100%"
        height="80"
        frameborder="0"
        allowfullscreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy">
      </iframe>
    </div>
  </li>
</ul>
      <div>
        <input v-model="searchQuery" @keyup.enter="searchSpotify" placeholder="Search Spotify..." />
        <select v-model="searchType">
          <option value="track">Tracks</option>
          <option value="playlist">Playlists</option>
          <option value="album">Albums</option>
          <option value="artist">Artists</option>
        </select>
        <button @click="searchSpotify">Search</button>
        <ul class="search-results">
          <li v-for="(item, index) in searchResults" :key="index">
            {{ item.name }} by {{ item.artists[0].name }}
            <!-- Embed Spotify player if the search type is 'track' and the item has a Spotify URI -->
            <div v-if="searchType === 'track' && item.external_urls.spotify">
              <iframe
                :src="`https://open.spotify.com/embed/track/${item.id}?utm_source=generator`"
                style="border-radius:12px"
                width="100%"
                height="80"
                frameborder="0"
                allowfullscreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy">
              </iframe>
            </div>
          </li>
        </ul>
      </div>
    
      <!-- Chat container -->
      <div class="chat-container">
        <ul class="messages">
          <li v-for="(message, index) in messages" :key="index">
            <strong>{{ message.email }}:</strong> {{ message.text }}
          </li>
        </ul>
        <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type a message..." />
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </template>
  



<style>
.chat-container {
    margin-top: 20px;
}

.messages {
    list-style: none;
    padding: 0;
    max-height: 300px;
    overflow-y: auto;
}

.messages li {
    margin-bottom: 10px;
}

input {
    width: calc(100% - 90px);
    padding: 8px;
}

button {
    width: 80px;
    height: 34px;
    margin-left: 10px;
}
.search-results {
  list-style: none;
  max-height: 200px;
  overflow-y: auto;
}
.featured-playlists {
  margin-top: 20px;
}

.featured-playlists li {
  margin-bottom: 10px;
}

.featured-playlists iframe {
  max-width: 100%;
  border: none;
  border-radius: 12px;
}
</style>