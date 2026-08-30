export const MAX_NUM_OF_MEDS = {
    maxMedsNum: "You must specify the maximum number of pills \nYou need to take daily!",
    amountSmallerThanMaxNumMeds: "You can't have a SMALLER Value in the Amount \nfield compared with the value typed in the \nMaximum Number of Meds per day!\n"
};

export const ERROR_MESSAGES_MODS_REMS = {
    validAmount: "You must specify a valid Amount!",
    amountGreaterThanThreshold: "Inventory Amount must be greater than the \nThreshold!",
    validThreshold: "You must specify a valid Threshold!",
};

export const ERRORS_DAILY_X_TIMES_A_DAY = {
    validMedicineIntake: "You must specify how many Times a Day is your \nMedicine Intake!",
    validTimeValues: "You must specify in all of Your Time Values \nof when you are going to take your Medicine!",
    exelOfNineNineBoxes: "You can't have more than 99 of Medicine Intake \nin a Day! Right now you have {count} in a Day!",
    intakePerTimeValue: "You must specify in all of Your Intake boxes for each of the \nTime Values what is the Intake of Your Medicine that \nyou are going to take!",
    duplicateTimeValues: "You can't have 2 or more Time Values that are the \nsame!",
    amountSmallerThanTotalMedsSum: "You can't have a SMALLER Value in the Amount \nfield compared with the Total Sum of the \nMeds you are taking in a day!\n",
    timeValuesAreEmpty: "You can't have empty Time Values!\n",
    medsValuesAreEmpty: "You can't have empty Med Values!\n",
};

export const ERRORS_WELCOME_SCREEN = {
    emailEmpty: "You must specify your Email Address!",
    emailIncorrect: "Your Email needs to be valid!",
    passwordEmpty: "You must specify your Password!",
    passwordNotEightCharLong: "The Password needs to be at least 8 characters long!",
    passwordNotUppLetterAndSymbol: "Your Password must have at least 1 uppercase letter and 1 symbol!",
    retypePasswordEmpty: "You must Retype your Password here!",
    passwordsDontMatch: "Your Passwords must match!"
};

export const MEDICATION_UNITS = [
  'IU (International Unit)', 'Ampoule(s)', 'application(s)','capsule(s)',
  'drop(s)', 'gram(s)', 'injection(s)','packet(s)', 'patch(es)',
  'pessary(ies)', 'piece(s)', 'pill(s)', 'puff(s)', 'spray(s)',
  'suppository(ies)', 'tablespoon(s)', 'teaspoon(s)', 'unit(s)',
  'vaginal capsules(s)', 'vaginal insert(s)', 'vaginal tablet(s)',
  'mcg/µg (Micrograms)', 'g (Grams)', 'mg (Milligrams)', 'ml (Milliliters)',
  'Milliequivalent(s) (mEq)', 'International normalized ratio (INR)',
  'Ounce(s) (oz)', 'Fluid ounce(s) (fl oz)', 'Millimole(s) (mmol)'
];

export const MEDICATION_FREQUENCIES = [
  'As needed (PRN)','Daily, X times a day', 'Daily, every X hours',
  'Every X days', 'Specific days of the week', 'Cycle: X days active, Y days inactive'
];

