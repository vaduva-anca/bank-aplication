
const Database = require('./Database.js');
class Client {

    constructor(accountCode,pin) {
        this.pin = pin;
        this.accountCode = accountCode;
    }


    
    async login() {
        const sql = 'select * from Clients where accountCode= ? and pin = ?';

        const values = [this.accountCode, this.pin];
        const [rows] = await Database.query(sql,values);

        var a ='2';
        if(a=='2'){
            console.log('ee');        }

        return rows;
    }
    async getBalance(){
        const sql = 'SELECT  SUM(t.transactionAmount) AS balance FROM Clients c LEFT JOIN Transactions t ON c.clientID = t.clientID WHERE c.accountCode = ? GROUP BY c.clientID, c.firstName, c.lastName;';
        const accountCode = this.accountCode;
        const [rows] = await Database.query(sql, [accountCode]);

    return rows;
    }
}
module.exports = Client;
