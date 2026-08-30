import { t } from './index';

export const UNIT_I18N_KEYS = {
  'IU (International Unit)': 'units.iu',
  'Ampoule(s)': 'units.ampoule',
  'application(s)': 'units.application',
  'capsule(s)': 'units.capsule',
  'drop(s)': 'units.drop',
  'gram(s)': 'units.gram',
  'injection(s)': 'units.injection',
  'packet(s)': 'units.packet',
  'patch(es)': 'units.patch',
  'pessary(ies)': 'units.pessary',
  'piece(s)': 'units.piece',
  'pill(s)': 'units.pill',
  'puff(s)': 'units.puff',
  'spray(s)': 'units.spray',
  'suppository(ies)': 'units.suppository',
  'tablespoon(s)': 'units.tablespoon',
  'teaspoon(s)': 'units.teaspoon',
  'unit(s)': 'units.unit',
  'vaginal capsules(s)': 'units.vaginalCapsule',
  'vaginal insert(s)': 'units.vaginalInsert',
  'vaginal tablet(s)': 'units.vaginalTablet',
  'mcg/µg (Micrograms)': 'units.mcg',
  'g (Grams)': 'units.g',
  'mg (Milligrams)': 'units.mg',
  'ml (Milliliters)': 'units.ml',
  'Milliequivalent(s) (mEq)': 'units.meq',
  'International normalized ratio (INR)': 'units.inr',
  'Ounce(s) (oz)': 'units.oz',
  'Fluid ounce(s) (fl oz)': 'units.floz',
  'Millimole(s) (mmol)': 'units.mmol',
};

export const FREQUENCY_I18N_KEYS = {
  'As needed (PRN)': 'freq.asNeeded',
  'Daily, X times a day': 'freq.dailyXTimes',
  'Daily, every X hours': 'freq.dailyEveryXHours',
  'Every X days': 'freq.everyXDays',
  'Specific days of the week': 'freq.specificDays',
  'Cycle: X days active, Y days inactive': 'freq.cycle',
};

export const FREQUENCY_PLACEHOLDER = 'Frequency of Meds e.g. day/hour etc';

export function unitLabel(unit) {
  const key = UNIT_I18N_KEYS[unit];
  return key ? t(key) : unit;
}

export function frequencyLabel(frequency) {
  const key = FREQUENCY_I18N_KEYS[frequency];
  return key ? t(key) : frequency;
}
