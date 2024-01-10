'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2022-11-18T21:31:17.178Z',
    '2022-12-23T07:42:02.383Z',
    '2023-01-28T09:15:04.904Z',
    '2023-04-01T10:17:24.185Z',
    '2023-05-08T14:11:59.604Z',
    '2023-11-12T17:01:17.194Z',
    '2023-11-14T23:36:17.929Z',
    '2023-11-15T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2022-11-01T13:15:33.035Z',
    '2022-11-30T09:48:16.867Z',
    '2022-12-25T06:04:23.907Z',
    '2023-01-25T14:18:46.235Z',
    '2023-02-05T16:33:06.386Z',
    '2023-04-10T14:43:26.374Z',
    '2023-06-25T18:49:59.371Z',
    '2023-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

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
const inputLogin = document.querySelector('.login__input');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');
let currentUser, balance, timer;
let sorted = false;

/////////////////////////////////////////////////
// Functions

//create an abbrevited username out of users name
const createUsername = function (accounts) {
  accounts.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsername(accounts);

//a function to internationalize numbers
const createIntlNums = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

//a function to create the date in the movements element
const createDateMovement = function (date) {
  const daysGone = (date, date2) =>
    Math.round(Math.abs(date - date2) / (1000 * 60 * 60 * 24));

  const daysPassed = daysGone(date, new Date());

  if (daysPassed === 0) return `TODAY.`;
  if (daysPassed === 1) return `YESTERDAY.`;
  if (daysPassed <= 7) return `${daysPassed} days ago.`;

  return new Intl.DateTimeFormat(currentUser.locale).format(date);
};

//display movements transaction function
const displayMov = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  //a ternary operator to decide wether the transactions are sorted or not
  const mov = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  mov.forEach(function (mov, i) {
    //create date from date movements array
    const dateMov = createDateMovement(new Date(currentUser.movementsDates[i]));

    //a ternary operator to decide if the transaction is a deposit or a withdrawal
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    //html element that will create the movement row
    const html = `
    <div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${dateMov}</div>
    <div class="movements__value">${createIntlNums(
      mov,
      currentUser.locale,
      currentUser.currency
    )}</div>
    </div>
  `;
    //insert the element into the page
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//calculate and display balance, deposits, withdrawals and interest
const calcDisplaySummaryBalance = function (Account) {
  //calculate the deposits transactions
  const inBalance = +Account.movements
    .filter(mov => mov > 0)
    .reduce((acc, total) => acc + total, 0)
    .toFixed(2);
  labelSumIn.textContent = `${createIntlNums(
    inBalance,
    currentUser.locale,
    currentUser.currency
  )}`;

  //calculate the withdrawals transactions
  const outBalance = +Math.abs(
    Account.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0)
  ).toFixed(2);
  labelSumOut.textContent = `${createIntlNums(
    outBalance,
    currentUser.locale,
    currentUser.currency
  )}`;

  //calculate the interest
  const interest = Account.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * Account.interestRate) / 100)
    .filter(mov => mov >= 1)
    .reduce((acc, total) => acc + total, 0)
    .toFixed(2);
  labelSumInterest.textContent = `${createIntlNums(
    interest,
    currentUser.locale,
    currentUser.currency
  )}`;

  //calculate and display balance
  Account.balance = inBalance - outBalance;
  labelBalance.textContent = `${createIntlNums(
    Account.balance,
    currentUser.locale,
    currentUser.currency
  )}`;
};

const displayDate = function () {
  const today = new Date();

  const options = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  };

  labelDate.textContent = new Intl.DateTimeFormat(
    currentUser.locale,
    options
  ).format(today);
};

//Create timer function
const createTimer = function () {
  let time = 300;
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(Math.trunc(time % 60)).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;

    //when the timer is finished
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = `Log in to get started`;
    }
    //decrease time by a second
    time--;
  };

  tick();

  timer = setInterval(tick, 1000);
};

const updateUI = function (acc) {
  //display  movements
  displayMov(acc);
  //display date of today
  displayDate();
  //display balance and summary
  calcDisplaySummaryBalance(acc);
};

/////////////////////////////////
//buttons functionality

//login button
btnLogin.addEventListener('click', function (e) {
  //prevent normal submit button behaviour
  e.preventDefault();

  //allocating current user
  currentUser = accounts.find(acc => inputLoginUsername.value === acc.username);

  console.log(currentUser);
  if (currentUser?.pin === Number(inputLoginPin.value)) {
    //display ui and welcome
    labelWelcome.textContent = `Welcome back, ${
      currentUser.owner.split(' ')[0]
    }.`;
    containerApp.style.opacity = 1;

    //clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLogin.blur();

    if (timer) clearInterval(timer);
    createTimer();

    updateUI(currentUser);
  }
});

//transfer money button
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = inputTransferAmount.value;
  const recieverUser = accounts.find(
    acc => inputTransferTo.value === acc.username
  );
  //add value to reciever and remove from user then update the ui
  if (
    amount > 0 &&
    amount <= currentUser.balance &&
    recieverUser &&
    recieverUser.username !== currentUser.username
  ) {
    inputTransferAmount.value = inputTransferTo.value = '';
    currentUser.movements.push(Number(-amount));
    recieverUser.movements.push(Number(amount));
    currentUser.movementsDates.push(new Date().toISOString());
    recieverUser.movementsDates.push(new Date().toISOString());
    updateUI(currentUser);
  }
  if (timer) clearInterval(timer);
  createTimer();
});

//loan request button
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const loanAmount = Number(inputLoanAmount.value);
  const anyDeposit = currentUser.movements.some(mov => mov > loanAmount * 0.1);
  if (anyDeposit && loanAmount > 0) {
    currentUser.movements.push(loanAmount);
    currentUser.movementsDates.push(new Date().toISOString());
    inputLoanAmount.value = '';
    updateUI(currentUser);
  }

  if (timer) clearInterval(timer);
  createTimer();
});

//sort by money ascending
btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  displayMov(currentUser, !sorted);

  sorted = !sorted;

  if (timer) clearInterval(timer);
  createTimer();
});

//delete account button
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  const deleteUser = inputCloseUsername.value;
  const deletePin = Number(inputClosePin.value);
  if (deleteUser === currentUser.username && deletePin === currentUser.pin) {
    const index = accounts.findIndex(
      acc => acc.username === currentUser.username
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
    labelWelcome.textContent = `Log in to get started`;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
