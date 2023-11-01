const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const PORT = 3000;
const Client = require('./Client.js');
const Transaction = require('./Transaction.js');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'test',
    password: 'root',
    port: 3306
});

app.use(cors());



app.post('/transfer/:sourceAccountCode/:destinationAccountCode/:amount', async (req, res) => {
    const { sourceAccountCode, destinationAccountCode, amount } = req.params;
    console.log(sourceAccountCode);
    console.log(destinationAccountCode);
    console.log(amount);

const transaction = new Transaction(" ",sourceAccountCode,destinationAccountCode,amount);
    try{
       await transaction.transferMoney();

       res.json({message:"Transfer completed successfuly"})
        
    } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to transfer money' });
        }



});
app.get('/transactions/:clientID', async (req, res) => {

    const transaction = new Transaction(req.params.clientID);
   
    console.log(`clientId ${req.params.clientID}`);


    try {
        const dataTransaction = await transaction.getAllTransactrions();
        console.log(JSON.stringify(dataTransaction));
        res.json(dataTransaction);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});


app.get('/balance/:accountCode', async (req, res) => {
    console.log(`hereee ${req.params.accountCode}`);
    const client = new Client(req.params.accountCode);
    try {
        const balance = await client.getBalance();
        res.json(balance);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});


app.get('/login', async (req, res) => {
    const client = new Client(req.query.accountCode, req.query.pin);
    try {
        const loginData = await client.login();

        res.json(loginData);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
    console.log(`Here we have the client object ${client}`);

});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
