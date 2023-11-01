const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const PORT = 3000;
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'test',
    password: 'root',
    port: 3306
});

app.use(cors());
class Database{
    static async query(sql,params){
        return await pool.execute(sql,params);

    }

    static async getConnection(){
        return await pool.getConnection();
    }



}
module.exports = Database;