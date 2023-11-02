'use strict';
 
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP
 
/////////////////////////////////////////////////
// Data

 
const accounts = [];
 
/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');
 
const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');
 
const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');
 
const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');
 
 
 
 
const contextAccount = null;
 
let cachedData = null;
 
const displayMovements = function (sort = false, clientID) {
  containerMovements.innerHTML = '';
 
    console.log(`http://localhost:3000/transactions/${clientID}`);
    fetch(`http://localhost:3000/transactions/${clientID}`)
      .then(response => response.json())
      .then(data => {
        cachedData = data; // Cache the fetched data
        processAndDisplayData(data, sort);
      })
      .catch(error => {
        console.error('Error:', error.message);
      });
  // }
};
 
function processAndDisplayData(apiResponse, sort) {
  const sortedData = sort ?
    apiResponse.slice().sort((a, b) => parseFloat(a.transactionAmount) - parseFloat(b.transactionAmount))
    : apiResponse;
 
  sortedData.forEach(function (transaction, i) {
    const type = parseFloat(transaction.transactionAmount) > 0 ? 'deposit' : 'withdrawal';
    const html = `
      <div class="movements__row">
          <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
          <div class="movements__value">${transaction.transactionAmount}€</div>
      </div>
    `;
 
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
}
 
btnTransfer.addEventListener('click', async function (e) {
  e.preventDefault();
  const inputToTransfer = document.querySelector('.form__input.form__input--to').value;
  const inputValueForAmmount = document.querySelector('.form__input.form__input--amount').value;
 
  let value = JSON.parse(localStorage.getItem('currentAccount'));
  const destinationAccountCode = inputToTransfer;
  const amount = inputValueForAmmount;
 
  const url = `http://localhost:3000/transfer/${value.accountCode}/${destinationAccountCode}/${amount}`
  fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }
  }
  ).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();  // Parse the response body as JSON
  })
    .then(data => {
      console.log(data);  // Process the response data here
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error.message);
    });
    const balanceData = await fetchBalance(value.accountCode);
 
 
    async function updateBalanceAfterDelay() {
      // Wait for 3 seconds (3000 milliseconds)
      await new Promise(resolve => setTimeout(resolve, 3000));
 
      const balanceData = await fetchBalance(value.accountCode);
      labelBalance.textContent = `${balanceData[0].balance}€`;
      displayMovements(false, value.clientID);
  }
 
 
 
 
  updateBalanceAfterDelay();
 
    labelBalance.textContent = `${balanceData[0].balance}€`;
 
});
 
 
 
 
 
const calcDisplayBalance = function (balance) {
  labelBalance.textContent = `${balance}€`;
};
 
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;
 
  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;
 
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};
 
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);
 
 
// Event handlers
let currentAccount;
let cachedDataAccount;
const fetchAccount = async (username, pin) => {
  const url = `http://localhost:3000/login?accountCode=${username}&pin=${pin}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch account');
  return  response.json();
};
 
const fetchBalance = async (clientID) => {
  const url = `http://localhost:3000/balance/${clientID}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch balance');
  return  response.json();
};
 
const updateUI = (account, balance) => {
  account.owner = `${account.firstName} ${account.lastName}`;
  account.interestRate = 1.5;
 
  labelWelcome.textContent = `Welcome back, ${account.owner}`;
  containerApp.style.opacity = 100;
  calcDisplayBalance(balance);
  displayMovements(false, account.clientID);
 
  inputLoginUsername.value = inputLoginPin.value = '';
  inputLoginPin.blur();
};
 
btnLogin.addEventListener('click', async function (e) {
  e.preventDefault();
 
  try {
    const accountData = await fetchAccount(inputLoginUsername.value, inputLoginPin.value);
 
    if (accountData.length > 0) {
      const currentAccount = accountData[0];
      const balanceData = await fetchBalance(currentAccount.accountCode);
 
 
      localStorage.setItem('currentAccount', JSON.stringify(currentAccount));
 
      updateUI(currentAccount, balanceData[0].balance);
    } else {
      console.error('Login failed: Invalid account code or pin');
      // Handle login failure, perhaps by showing an error message to the user
    }
  } catch (err) {
    console.error('Error during login:', err);
  }
});
 
 
 
 
 
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
 
  const amount = Number(inputLoanAmount.value);
 
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);
 
    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});
 
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
 
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)
 
    // Delete account
    accounts.splice(index, 1);
 
    // Hide UI
    containerApp.style.opacity = 0;
  }
 
  inputCloseUsername.value = inputClosePin.value = '';
});
 
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
 
 
 
// Usage example:
 
 
 
 
 
 
 
 
 
 
 
 
 
// Array Methods Practice
 
// 1.
const bankDepositSum = accounts
  .flatMap(acc => acc.movements)
  .filter(mov => mov > 0)
  .reduce((sum, cur) => sum + cur, 0);
 
console.log(bankDepositSum);
 
 
const numDeposits1000 = accounts
  .flatMap(acc => acc.movements)
  .reduce((count, cur) => (cur >= 1000 ? ++count : count), 0);
 
console.log(numDeposits1000);
 
// Prefixed ++ oeprator
let a = 10;
console.log(++a);
console.log(a);
 
// 3.
const { deposits, withdrawals } = accounts
  .flatMap(acc => acc.movements)
  .reduce(
    (sums, cur) => {
 
      sums[cur > 0 ? 'deposits' : 'withdrawals'] += cur;
      return sums;
    },
    { deposits: 0, withdrawals: 0 }
  );
 
console.log(deposits, withdrawals);
 
// 4.
// this is a nice title -> This Is a Nice Title
const convertTitleCase = function (title) {
  const capitzalize = str => str[0].toUpperCase() + str.slice(1);
 
  const exceptions = ['a', 'an', 'and', 'the', 'but', 'or', 'on', 'in', 'with'];
 
  const titleCase = title
    .toLowerCase()
    .split(' ')
    .map(word => (exceptions.includes(word) ? word : capitzalize(word)))
    .join(' ');
 
  return capitzalize(titleCase);
};
 
console.log(convertTitleCase('this is a nice title'));
console.log(convertTitleCase('this is a LONG title but not too long'));
console.log(convertTitleCase('and here is another title with an EXAMPLE'));