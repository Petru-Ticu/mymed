import { parseScannedMedication, matchMedicationUnit } from '../src/utils/parseScannedMedication';
import { getRequiredNameError, NAME_CHAR_FILTER } from '../src/utils/inputRules';

describe('parseScannedMedication', () => {
  it('fills name, unit and notes from JSON QR payloads', () => {
    const parsed = parseScannedMedication(JSON.stringify({
      name: 'Aspirin',
      unit: 'mg',
      notes: 'Take with food',
      barcode: '5901234123457',
    }));
    expect(parsed.productName).toBe('Aspirin');
    expect(parsed.unit).toBe('mg (Milligrams)');
    expect(parsed.importantInfo).toBe('Take with food');
    expect(parsed.barcode).toBe('5901234123457');
  });

  it('fills the name field from a numeric barcode', () => {
    const parsed = parseScannedMedication('5901234123457');
    expect(parsed.productName).toBe('5901234123457');
    expect(parsed.barcode).toBe('5901234123457');
    expect(parsed.importantInfo).toMatch(/5901234123457/);
  });

  it('parses pipe-separated product data', () => {
    const parsed = parseScannedMedication('Ibuprofen|ml|Shake well');
    expect(parsed.productName).toBe('Ibuprofen');
    expect(parsed.unit).toBe('ml (Milliliters)');
    expect(parsed.importantInfo).toBe('Shake well');
  });

  it('returns empty fields for blank input', () => {
    expect(parseScannedMedication('')).toEqual({
      productName: '',
      unit: '',
      importantInfo: '',
      barcode: '',
    });
  });
});

describe('matchMedicationUnit', () => {
  it('maps mg to the catalog unit', () => {
    expect(matchMedicationUnit('mg')).toBe('mg (Milligrams)');
  });
});

describe('name rules', () => {
  it('allows Romanian letters', () => {
    expect(NAME_CHAR_FILTER.test('Ștefan')).toBe(true);
    expect(getRequiredNameError('Ștefan', 'empty')).toBe('');
  });

  it('rejects digits in names', () => {
    expect(getRequiredNameError('Ion8', 'empty')).toBe('errors.account.nameInvalid');
  });
});
