const Database = require('./Database.js');
class Transaction {
    constructor(clientId, sourceAccountCode, destinationAccountCode, amount) {
        this.clientId = clientId;
        this.sourceAccountCode = sourceAccountCode;
        this.destinationAccountCode = destinationAccountCode;
        this.amount = amount;
    }

    async getAllTransactrions() {

        const clientID = this.clientId;

        console.log(`clientId from callss     ${clientID}`);
        const sql = 'select * from Transactions where clientId = ?';
        const [rows] = await Database.query(sql, [clientID]);
        console.log(`clientId from callss     ${clientID}`);
        return rows;
    }

    async transferMoney() {
        // Deduct from source account
        const deductSql = `
           INSERT INTO Transactions (clientID, transactionDate, transactionAmount, description)
           VALUES (
               (SELECT clientID FROM Clients WHERE accountCode = ?),
               CURDATE(),
               ?,
               CONCAT('Transfer to ', ?)
           );
         `;
        // Add to destination account
        const addSql = `
        INSERT INTO Transactions (clientID, transactionDate, transactionAmount, description)
        VALUES (
            (SELECT clientID FROM Clients WHERE accountCode = ?),
            CURDATE(),
            ?,
            CONCAT('Received from ', ?)
        );
      `;

        const connection = await Database.getConnection();
        try {

            await connection.beginTransaction();

            await connection.execute(deductSql, [this.sourceAccountCode, -this.amount, this.destinationAccountCode]);
            await connection.execute(addSql, [this.destinationAccountCode, this.amount, this.sourceAccountCode]);
            await connection.commit();
        } catch (err) {
            console.log(`error for this ${err}`);
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }


    }
}
module.exports = Transaction;