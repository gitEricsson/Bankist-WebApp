'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

interface Account {
  owner: string;
  movements: number[];
  interestRate: number;
  pin: number;
  movementsDates: string[];
  currency: string;
  locale: string;
  username?: string;
  balance?: number;
}

const account1: Account = {
  owner: 'Ericsson Raphael',
  movements: [45000, 5400, 200, -7900, -570, -879, 6540, -32],
  interestRate: 1.6,
  pin: 1111,
  movementsDates: [
    '2018-11-01T13:15:33.035Z',
    '2019-03-30T09:48:16.867Z',
    '2019-12-25T09:15:04.904Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2022-05-10T17:01:17.194Z',
    '2022-04-25T18:49:59.371Z',
    '2023-07-26T12:01:20.894Z',
  ],
  currency: 'NGN',
  locale: 'en-NG',
};

const account2: Account = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 2222,
  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2021-04-01T10:17:24.185Z',
    '2021-05-08T14:11:59.604Z',
    '2022-05-17T17:01:17.194Z',
    '2022-05-19T23:36:17.929Z',
    '2022-05-22T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account3: Account = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 3333,
  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts: Account[] = [account1, account2, account3];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome') as HTMLElement;
const labelDate = document.querySelector('.date') as HTMLElement;
const labelBalance = document.querySelector('.balance__value') as HTMLElement;
const labelSumIn = document.querySelector('.summary__value--in') as HTMLElement;
const labelSumOut = document.querySelector(
  '.summary__value--out'
) as HTMLElement;
const labelSumInterest = document.querySelector(
  '.summary__value--interest'
) as HTMLElement;
const labelTimer = document.querySelector('.timer') as HTMLElement;

const containerApp = document.querySelector('.app') as HTMLElement;
const containerMovements = document.querySelector('.movements') as HTMLElement;

const btnLogin = document.querySelector('.login__btn') as HTMLButtonElement;
const btnTransfer = document.querySelector(
  '.form__btn--transfer'
) as HTMLButtonElement;
const btnLoan = document.querySelector('.form__btn--loan') as HTMLButtonElement;
const btnClose = document.querySelector(
  '.form__btn--close'
) as HTMLButtonElement;
const btnSort = document.querySelector('.btn--sort') as HTMLButtonElement;

const inputLoginUsername = document.querySelector(
  '.login__input--user'
) as HTMLInputElement;
const inputLoginPin = document.querySelector(
  '.login__input--pin'
) as HTMLInputElement;
const inputTransferTo = document.querySelector(
  '.form__input--to'
) as HTMLInputElement;
const inputTransferAmount = document.querySelector(
  '.form__input--amount'
) as HTMLInputElement;
const inputLoanAmount = document.querySelector(
  '.form__input--loan-amount'
) as HTMLInputElement;
const inputCloseUsername = document.querySelector(
  '.form__input--user'
) as HTMLInputElement;
const inputClosePin = document.querySelector(
  '.form__input--pin'
) as HTMLInputElement;

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date: Date, locale: string): string {
  const calcDaysPassed = (date1: Date, date2: Date): number =>
    Math.round(
      Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24)
    );

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (
  value: number,
  locale: string,
  currency: string
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc: Account, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc: Account) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc: Account) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);
  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs: Account[]) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc: Account) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');

    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = '0';
    }

    // Decrease it
    time--;
  };
  // Set time to 5 minutes
  let time = 300;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount: Account | undefined, timer: ReturnType<typeof setInterval>;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = '100';

    // Create current date and time
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';

    inputLoginPin.blur();

    // Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount?.balance! >= amount &&
    receiverAcc?.username !== currentAccount?.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(+inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount?.movements.some(mov => mov >= amount * 0.1)
  ) {
    setTimeout(function () {
      // Add movement
      currentAccount!.movements.push(amount);

      // Add loan date
      currentAccount!.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount!);

      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount?.username &&
    +inputClosePin.value === currentAccount?.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount?.username
    );

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = '0';
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount!, !sorted);
  sorted = !sorted;
});