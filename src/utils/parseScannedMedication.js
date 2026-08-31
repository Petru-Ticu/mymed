import { MEDICATION_UNITS } from '../constants';

const NAME_MAX = 35;
const INFO_MAX = 200;

const UNIT_PATTERNS = [
  ['mg (Milligrams)', /\bmg\b/i],
  ['mcg/µg (Micrograms)', /\b(mcg|µg|ug)\b/i],
  ['ml (Milliliters)', /\bml\b/i],
  ['pill(s)', /\bpills?\b/i],
  ['capsule(s)', /\bcapsules?\b/i],
  ['drop(s)', /\bdrops?\b/i],
  ['teaspoon(s)', /\b(tsp|teaspoons?)\b/i],
  ['tablespoon(s)', /\b(tbsp|tablespoons?)\b/i],
  ['g (Grams)', /\bgrams?\b/i],
];

function clip(value, max) {
  return String(value || '').trim().slice(0, max);
}

export function matchMedicationUnit(value) {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }
  const exact = MEDICATION_UNITS.find((unit) => unit.toLowerCase() === text.toLowerCase());
  if (exact) {
    return exact;
  }
  const contained = MEDICATION_UNITS.find((unit) => (
    text.toLowerCase() === unit.toLowerCase().split(' ')[0].replace(/[^a-zµμ]/g, '')
  ));
  if (contained) {
    return contained;
  }
  for (let index = 0; index < UNIT_PATTERNS.length; index += 1) {
    const [unit, pattern] = UNIT_PATTERNS[index];
    if (pattern.test(text)) {
      return unit;
    }
  }
  return '';
}

function fromObject(obj = {}) {
  return {
    productName: clip(obj.productName || obj.name || obj.brand || obj.medicine || obj.product, NAME_MAX),
    unit: matchMedicationUnit(obj.unit || obj.dosageUnit || obj.measurement || ''),
    importantInfo: clip(obj.importantInfo || obj.notes || obj.info || obj.instructions, INFO_MAX),
    barcode: clip(obj.barcode || obj.gtin || obj.code, 64),
  };
}

function looksNumericCode(data) {
  return /^[0-9]{8,14}$/.test(String(data).replace(/\s/g, ''));
}

function parseGs1(data) {
  const match = String(data).match(/\(01\)(\d{8,14})/);
  return match ? match[1] : '';
}

function parseLabeledLines(data) {
  const obj = {};
  String(data).split(/[\n;]+/).forEach((line) => {
    const match = line.match(/^\s*([A-Za-z ]+)\s*[:=]\s*(.+)\s*$/);
    if (match) {
      obj[match[1].trim().toLowerCase().replace(/\s+/g, '')] = match[2].trim();
    }
  });
  if (obj.name || obj.productname || obj.brand || obj.medicine) {
    return fromObject({
      productName: obj.productname || obj.name || obj.brand || obj.medicine,
      unit: obj.unit,
      importantInfo: obj.info || obj.notes || obj.importantinfo,
      barcode: obj.barcode,
    });
  }
  return null;
}

function withBarcodeFallback(parsed, data) {
  const barcode = parsed.barcode || clip(data, 64);
  const productName = parsed.productName || clip(data, NAME_MAX);
  let importantInfo = parsed.importantInfo;
  if (!importantInfo && (looksNumericCode(data) || parseGs1(data))) {
    importantInfo = clip(`Barcode: ${barcode}`, INFO_MAX);
  }
  return {
    productName,
    unit: parsed.unit || '',
    importantInfo,
    barcode,
  };
}

export function parseScannedMedication(raw) {
  const data = String(raw || '').trim();
  if (!data) {
    return { productName: '', unit: '', importantInfo: '', barcode: '' };
  }

  if (data.startsWith('{') || data.startsWith('[')) {
    try {
      const parsed = JSON.parse(data);
      const obj = Array.isArray(parsed) ? parsed[0] : parsed;
      if (obj && typeof obj === 'object') {
        return withBarcodeFallback(fromObject(obj), data);
      }
    } catch (error) {
      // Use the raw scan text below.
    }
  }

  try {
    const hasQuery = data.includes('=') && (data.includes('://') || data.includes('?'));
    if (hasQuery) {
      const url = data.includes('://') ? new URL(data) : null;
      const params = url
        ? url.searchParams
        : new URLSearchParams(data.includes('?') ? data.split('?')[1] : data);
      const obj = Object.fromEntries(params.entries());
      if (obj.name || obj.productName || obj.brand || obj.medicine) {
        return withBarcodeFallback(fromObject(obj), data);
      }
    }
  } catch (error) {
    // Fall through to simpler formats.
  }

  const labeled = parseLabeledLines(data);
  if (labeled) {
    return withBarcodeFallback(labeled, data);
  }

  if (data.includes('|')) {
    const [name, unit, info] = data.split('|').map((part) => part.trim());
    return withBarcodeFallback({
      productName: clip(name, NAME_MAX),
      unit: matchMedicationUnit(unit),
      importantInfo: clip(info, INFO_MAX),
      barcode: '',
    }, data);
  }

  const gtin = parseGs1(data);
  const unit = matchMedicationUnit(data);
  const barcode = gtin || (looksNumericCode(data) ? data.replace(/\s/g, '') : clip(data, 64));
  return withBarcodeFallback({
    productName: looksNumericCode(data) || gtin ? clip(barcode, NAME_MAX) : clip(data, NAME_MAX),
    unit,
    importantInfo: '',
    barcode,
  }, data);
}
