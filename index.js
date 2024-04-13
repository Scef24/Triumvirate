const mysql = require('mysql2')


const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database: 'spotify'
})

connection.connect(err=>{
    if(err) {
            console.log('Error Communicating', err)
    }
    else 
{
    console.log('Success')
}
})