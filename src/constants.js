const MAX_NUM_OF_MEDS = {
  maxMedsNum: 'errors.mods.maxMedsNum',
  amountSmallerThanMaxNumMeds: 'errors.mods.amountSmallerThanMaxNumMeds',
};

const ERROR_MESSAGES_MODS_REMS = {
  validAmount: 'errors.mods.validAmount',
  amountGreaterThanThreshold: 'errors.mods.amountGreaterThanThreshold',
  validThreshold: 'errors.mods.validThreshold',
};

const ERRORS_DAILY_X_TIMES_A_DAY = {
  validMedicineIntake: 'errors.daily.validMedicineIntake',
  validTimeValues: 'errors.daily.validTimeValues',
  exelOfNineNineBoxes: 'errors.daily.exceeds99',
  intakePerTimeValue: 'errors.daily.intakePerTimeValue',
  duplicateTimeValues: 'errors.daily.duplicateTimeValues',
  amountSmallerThanTotalMedsSum: 'errors.daily.amountSmallerThanTotalMedsSum',
  timeValuesAreEmpty: 'errors.daily.timeValuesAreEmpty',
  medsValuesAreEmpty: 'errors.daily.medsValuesAreEmpty',
};

const ERRORS_WELCOME_SCREEN = {
  emailEmpty: 'errors.welcome.emailEmpty',
  emailIncorrect: 'errors.welcome.emailIncorrect',
  passwordEmpty: 'errors.welcome.passwordEmpty',
  passwordNotEightCharLong: 'errors.welcome.passwordNotEightCharLong',
  passwordNotUppLetterAndSymbol: 'errors.welcome.passwordNotUppLetterAndSymbol',
  retypePasswordEmpty: 'errors.welcome.retypePasswordEmpty',
  passwordsDontMatch: 'errors.welcome.passwordsDontMatch',
};

const ERRORS_ACCOUNT_SETTINGS = {
  firstNameEmpty: 'errors.account.firstNameEmpty',
  lastNameEmpty: 'errors.account.lastNameEmpty',
  nameInvalid: 'errors.account.nameInvalid',
  genderEmpty: 'errors.account.genderEmpty',
  birthDateEmpty: 'errors.account.birthDateEmpty',
  birthDateInvalid: 'errors.account.birthDateInvalid',
  birthDateFuture: 'errors.account.birthDateFuture',
  currentPasswordEmpty: 'errors.account.currentPasswordEmpty',
  currentPasswordWrong: 'errors.account.currentPasswordWrong',
  newPasswordEmpty: 'errors.account.newPasswordEmpty',
  retypeNewPasswordEmpty: 'errors.account.retypeNewPasswordEmpty',
};

const MEDICATION_UNITS = [
  'IU (International Unit)', 'Ampoule(s)', 'application(s)', 'capsule(s)',
  'drop(s)', 'gram(s)', 'injection(s)', 'packet(s)', 'patch(es)',
  'pessary(ies)', 'piece(s)', 'pill(s)', 'puff(s)', 'spray(s)',
  'suppository(ies)', 'tablespoon(s)', 'teaspoon(s)', 'unit(s)',
  'vaginal capsules(s)', 'vaginal insert(s)', 'vaginal tablet(s)',
  'mcg/µg (Micrograms)', 'g (Grams)', 'mg (Milligrams)', 'ml (Milliliters)',
  'Milliequivalent(s) (mEq)', 'International normalized ratio (INR)',
  'Ounce(s) (oz)', 'Fluid ounce(s) (fl oz)', 'Millimole(s) (mmol)',
];

const MEDICATION_FREQUENCIES = [
  'As needed (PRN)', 'Daily, X times a day', 'Daily, every X hours',
  'Every X days', 'Specific days of the week', 'Cycle: X days active, Y days inactive',
];

export {
  MAX_NUM_OF_MEDS,
  ERROR_MESSAGES_MODS_REMS,
  ERRORS_DAILY_X_TIMES_A_DAY,
  ERRORS_WELCOME_SCREEN,
  ERRORS_ACCOUNT_SETTINGS,
  MEDICATION_UNITS,
  MEDICATION_FREQUENCIES,
};
