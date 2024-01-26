'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data


const accounts = [];

/////////////////////////////////////////////////
// Elemente dinamice
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
const btWithdraw = document.querySelector('.form__btn--withdraw');
const btTransferMyAccoutns = document.querySelector('.button-transfer-my-accounts');
const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');
document.addEventListener('DOMContentLoaded', function() {});

const logOut = document.querySelector('#log-out');
logOut.addEventListener('click', function () {
  location.reload();
  localStorage.clear();
});
const contextAccount = null;

let cachedData = null;

const displayMovements = async function (clientID, sort = false) {
  containerMovements.innerHTML = '';

  try {
    const data = await fetchMovements(clientID);
    processAndDisplayData(data, sort);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Funcție de preluare a mișcărilor de pe server
async function fetchMovements(clientID) {
  const response = await fetch(`http://localhost:3000/transactions/${clientID}`);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

// Funcție de procesare și afișare a datelor
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
// eveniment afaugat pe butonul de transfer (conturi propriu)
btTransferMyAccoutns.addEventListener('click',  function (e) {
  e.preventDefault();
  const inputToTransfer = document.querySelector('.my_accounts_options').value;
  console.log(inputToTransfer)
  const inputValueForAmount = document.querySelector('.form_input_my_accounts-ammount').value;
console.log(inputValueForAmount);
  try {
    const currentAccount = JSON.parse(localStorage.getItem('currentAccount'));
    const destinationAccountCode = inputToTransfer;
    const amount = inputValueForAmount;

    const url = `http://localhost:3000/transfer/${currentAccount.accountCode}/${destinationAccountCode}/${amount}`;
    fetchTransfer(url)
    .then(() => updateBalanceAfterDelay(currentAccount.accountCode))
    .then(() => console.log('Transfer completed successfully'))
.then(()=>inputValueForAmount.value = 0)
    .catch(error => console.error('There was a problem with the fetch operation:', error.message));
    
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error.message);
  }
});


// buton pentru a se declansa evenimentul pentru a transfera banii (in orice cont strain)
btnTransfer.addEventListener('click',  function (e) {
  e.preventDefault();
  const inputToTransfer = document.querySelector('.form__input.form__input--to').value;
  const inputValueForAmount = document.querySelector('.form__input.form__input--amount').value;

  try {
    const currentAccount = JSON.parse(localStorage.getItem('currentAccount'));
    const destinationAccountCode = inputToTransfer;
    const amount = inputValueForAmount;

    const url = `http://localhost:3000/transfer/${currentAccount.accountCode}/${destinationAccountCode}/${amount}`;
    fetchTransfer(url)
    .then(() => updateBalanceAfterDelay(currentAccount.accountCode))
    .then(() => console.log('Transfer completed successfully'))
    .catch(error => console.error('There was a problem with the fetch operation:', error.message));
    
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error.message);
  }
});
btWithdraw.addEventListener('click',function (e){
  e.preventDefault();
  const inputValueForAmount = document.querySelector('.test-input');
  console.log(inputValueForAmount);

  try {
    const currentAccount = JSON.parse(localStorage.getItem('currentAccount'));
    const amount = inputValueForAmount.value;
console.log(amount);
    const url = `http://localhost:3000/transfer/${currentAccount.accountCode}/${amount}`;
    fetchTransfer(url)
    .then(() => updateBalanceAfterDelay(currentAccount.accountCode))
    .then(() => console.log('Transfer completed successfully'))
    .catch(error => console.error('There was a problem with the fetch operation:', error.message));
    
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error.message);
  }
})

// Function pentru a se rwliza transferul (se apeleaza un API )
async function fetchTransfer(url) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
}

// Funcție de actualizare a soldului 
async function updateBalanceAfterDelay(accountCode) {
  // Wait for 3 seconds (3000 milliseconds)
  await new Promise(resolve => setTimeout(resolve, 3000));

  const balanceData = await fetchBalance(accountCode);
  labelBalance.textContent = `${balanceData[0].balance}€`;
  displayMovements(currentAccount.clientID, false);
}

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
// Partea de logare 
const fetchAccount = async (username, pin) => {
  const url = `http://localhost:3000/login?accountCode=${username}&pin=${pin}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch account');
  return response.json();
};

const fetchBalance = async (clientID) => {
  const url = `http://localhost:3000/balance/${clientID}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch balance');
  return response.json();
};
// Update fereastra UI
const updateUI = (account, balance) => {
  account.owner = `${account.firstName} ${account.lastName}`;
  account.interestRate = 1.5;

  labelWelcome.textContent = `Welcome back, ${account.owner}`;
  containerApp.style.opacity = 100;
  calcDisplayBalance(balance);
  displayMovements(account.clientID, false);

  inputLoginUsername.value = inputLoginPin.value = '';
  inputLoginPin.blur();
};

// Functie pentru a se realiza login
btnLogin.addEventListener('click', function (e) {
  localStorage.clear();
  e.preventDefault();

  let accountData; 

  //salvare date despre cont 
  fetchAccount(inputLoginUsername.value, inputLoginPin.value)
    .then(data => {
      accountData = data; // Setați accountData în acest moment
      if (accountData.length > 0) {
        const currentAccount = accountData[0];
        return fetchBalance(currentAccount.accountCode);
      } else {
        console.error('Login failed: Invalid account code or pin');
        // Gestionați eșecul de conectare, poate afișând un mesaj de eroare utilizatorului
        return Promise.reject(new Error('Invalid account code or pin'));
      }
    })
    .then(balanceData => {
      const currentAccount = JSON.stringify(accountData[0]);

      localStorage.setItem('currentAccount', currentAccount);
      updateUI(accountData[0], balanceData[0].balance);
    })
    .catch(err => {
      console.error('Error during login:', err);
    });
});
 

// Function to handle loan
function handleLoan(e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Adauga tranzactii
    currentAccount.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
}

// Funcție de gestionare a închiderii contului
function handleCloseAccount(e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(acc => acc.username === currentAccount.username);

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
}

// Funcție de gestionare a mișcărilor de sortare
function handleSortMovements(e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);

}

// Event listeners
btnLoan.addEventListener('click', handleLoan);
btnClose.addEventListener('click', handleCloseAccount);
btnSort.addEventListener('click', handleSortMovements);




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




