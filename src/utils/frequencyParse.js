import moment from 'moment';

// Shared helpers for reading saved frequency / inventory text back into form values.

export function inventoryValue(value) {
  if (value == null) {
    return '';
  }
  const text = String(value).trim();
  if (!text || text.toLowerCase() === 'null') {
    return '';
  }
  return text;
}

export function parseStoredDate(value) {
  if (!value) {
    return null;
  }
  const parsed = moment(value, ['DD-MM-YYYY', 'DD.MM.YYYY', 'YYYY-MM-DD'], true);
  return parsed.isValid() ? parsed : null;
}

// Turns the stored frequency string back into the objects the typing screen uses.
export function parseFrequencyText(modalFrequency) {
  if (!modalFrequency || typeof modalFrequency !== 'string') {
    return { type: null, modalName: '', details: null };
  }

  const fieldValue = (label) => {
    const match = modalFrequency.match(new RegExp(`${label}:\\s*(.+)`));
    return match ? match[1].trim() : '';
  };

  const text = modalFrequency.trim();

  if (text.startsWith('As Needed (PRN)')) {
    const details = {
      maxNumPills: inventoryValue(fieldValue('Maximum Number of Meds Per Day')),
      AmountAsNeeded: inventoryValue(fieldValue('Amount')) || 'Null',
      ThresholdAsNeeded: inventoryValue(fieldValue('Threshold')) || 'Null',
    };
    return { type: 'asNeeded', modalName: 'As needed (PRN)', details };
  }

  if (text.startsWith('Daily X Times a Day')) {
    const times = [];
    const numbered = /(\d+)\.\s*(\d{1,2}):([0-5]\d)\s*-\s*meds:\s*([1-9]\d?)/gi;
    let match;
    while ((match = numbered.exec(text))) {
      times.push({
        position: Number(match[1]),
        time: `${String(Number(match[2])).padStart(2, '0')}:${match[3]}`,
        meds: match[4],
      });
    }
    if (!times.length) {
      const loose = /(\d{1,2}):([0-5]\d)\s*-\s*meds:\s*([1-9]\d?)/gi;
      let position = 0;
      while ((match = loose.exec(text))) {
        position += 1;
        times.push({
          position,
          time: `${String(Number(match[1])).padStart(2, '0')}:${match[2]}`,
          meds: match[3],
        });
      }
    }
    const details = {
      numberOfHowManyTAD: inventoryValue(fieldValue('Number of Times in a Day you are taking the Meds')) || String(times.length || ''),
      timesAndMedsRenderedList: times,
      amountDXTAD: inventoryValue(fieldValue('Amount')) || 'Null',
      thresholdDXTAD: inventoryValue(fieldValue('Threshold')) || 'Null',
    };
    return { type: 'dailyXTimesADay', modalName: 'Daily, X times a day', details };
  }

  return { type: null, modalName: '', details: null };
}
