'use strict';

// BANK APP

// Data
const account1 = {
  owner: 'Michael Tran',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Rio Le',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Tommy Ngo',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Alex Huynh',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

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

// Function for displaying movements in the app
const displayMovements = function (movements, sort = false) {
  // emptying movements section before adding any deposits/withdrawals
  containerMovements.innerHTML = '';

  // Sort movements?
  // Using slice to create shallow copy
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    // using template literal to add html to the DOM
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__value">$${mov}</div>
      </div>`;

    // 'afterbegin' adds the html right at the start of the "movements" section
    // aka: top of list
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// Calculating the current balance for the account and displaying it.
const calcDisplayBalance = function (acc) {
  // Remember we can add a property to this acc object because we pass
  // objects by reference
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `$${acc.balance}`;
};

// Calculating and displaying the total incoming and outcoming movements
const calcDisplaySummary = function (acc) {
  const inc = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `$${inc}`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `$${Math.abs(out)}`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `$${interest}`;
};

// Creates usernames based on the initials
const createUsernames = function (acc) {
  // We will be traversing the array with all accounts,
  // and creating and adding a username to each account object.
  // Since split returns an array with each name, we can immediately call the
  // map method on the returned array.
  // And then that returns an array with the initials, so we call the join method
  // on it to combine them into a single string.
  // Also, we use forEach and not map to loop over the array because we do not want to create a new array.
  acc.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

// Event Handlers
let currentAcc;

// Update UI
const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

// Logging in functionality
btnLogin.addEventListener('click', function (e) {
  // Prevents the default event from occuring, so form submission does not reload page
  e.preventDefault();

  // Comparing input from form field to accounts array, and returning correct account
  currentAcc = accounts.find(acc => acc.username === inputLoginUsername.value);

  // So first we check to see if the current account exists with '?',
  // Then we chain the rest, the pin property will only be read if the account exists.
  if (currentAcc?.pin === Number(inputLoginPin.value)) {
    // Display UI and the welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAcc.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginPin.value = inputLoginUsername.value = '';

    // Update UI
    updateUI(currentAcc);
  }
});

// Transfering money to another account
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const recieverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  // Removing movement from the current account (if they have enough money)
  if (
    amount > 0 &&
    recieverAcc &&
    currentAcc.balance >= amount &&
    recieverAcc.username !== currentAcc.username
  ) {
    currentAcc.movements.push(-amount);
    recieverAcc.movements.push(amount);
  }

  updateUI(currentAcc);
});

// Requesting loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAcc.movements.some(mov => mov >= amount * 0.1)) {
    // Add loan movement
    currentAcc.movements.push(amount);

    // Update UI
    updateUI(currentAcc);
  }
  inputLoanAmount.value = '';
});

// Closing Account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAcc.username &&
    Number(inputClosePin.value) === currentAcc.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAcc.username
    );

    // Saving name to say goodbye
    const name = currentAcc.owner;

    // Deleting the single found account at said index
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;

    // Goodbye
    labelWelcome.textContent = `Goodbye ${name}`;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

// Sorting button
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  // passing in !sorted because we want the opposite to happen when we click sort
  displayMovements(currentAcc.movements, !sorted);
  sorted = !sorted;
});
