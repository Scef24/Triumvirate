const express = require('express');
const WebSocket = require('ws');
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

function saveMessage(email, message) {
    const sql = 'INSERT into messages (email, text) values (?, ?)';
    connection.query(sql, [email, message], (error, result) => {
        if (error) {
            console.error('Failed to insert message:', error);
            return;
        }
        console.log('Message saved:', result.insertId);
    });
}

const app = express();
app.use(express.static('.'));
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        const parsedData = JSON.parse(message);
        if (parsedData.email) {
            saveMessage(parsedData.message, parsedData.email,(error,result)=>{
                if(!error) {
                    const broadcastData = JSON.stringify({
                        email:parsedData.email,
                        message:parsedData.message
                    })
                }
            })
        }

        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(broadcastData);
            }
        });
    });
});

app.post('/api/messages', (req, res) => {
    const { email, message } = req.body;
    saveMessage(email, message, (error, result) => {
        if (error) {
            console.error('Failed to insert message:', error);
            return res.status(500).json({message: 'Failed to save message'});
        }
        console.log('Message saved:', result.insertId);
        res.json({message: 'Message saved', messageId: result.insertId});
    });
});

app.get('/api/messages', (req, res) => {
    const sql = 'SELECT * FROM messages';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Failed to retrieve messages:', error);
            res.status(500).send('Failed to retrieve messages');
            return;
        }
        res.json(results);
    });
});
server.listen(3001, () => {
    console.log(`Server is running from http://localhost:3001`);
});

checkDatabaseConnection();
