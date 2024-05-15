const express = require('express');
const socketIo = require('socket.io');
const mysql = require('mysql2');
const http = require('http');
const cors = require('cors');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'spotify'
});

function checkDatabaseConnection() {
    connection.connect(err => {
        if (err) {
            console.error('Error connecting to the database:', err.stack);
            return;
        }
        console.log('Connected to the database.');
    });
}

function saveMessage(email, message, callback) {
    const sql = 'INSERT INTO messages (email, text) VALUES (?, ?)';
    connection.query(sql, [email, message], (error, result) => {
        if (error) {
            console.error('Failed to insert message:', error);
            callback(error, null);
            return;
        }
        console.log('Message saved:', result.insertId);
        callback(null, result);
    });
}

const app = express();
app.use(express.static('.'));
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.post('/api/messages', (req, res) => {
    const { email, message } = req.body;
    console.log('Received message:', email, message); // Debugging line

    saveMessage(email, message, (error, result) => {
        if (error) {
            console.error('Failed to insert message:', error);
            return res.status(500).json({ message: 'Failed to save message' });
        }
        console.log('Message saved:', result.insertId);
        res.json({ message: 'Message saved', messageId: result.insertId });

        // Emit the new message event to all connected clients
        io.emit('message', JSON.stringify({ email, message }));
    });
});

app.get('/api/getmessages', (req, res) => {
    const sql = 'SELECT * FROM messages';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Failed to retrieve messages:', error);
            return res.status(500).send('Failed to retrieve messages');
        }
        res.json(results);
    });
});

server.listen(3001, () => {
    console.log(`Server is running from http://localhost:3001`);
});

checkDatabaseConnection();

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('message', (message) => {
        const parsedData = JSON.parse(message);
        if (parsedData.email) {
            saveMessage(parsedData.email, parsedData.message, (error, result) => {
                if (error) {
                    console.error('Error saving message:', error);
                } else {
                    io.emit('message', message);
                }
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});
