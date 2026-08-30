function isoNow(date = new Date()) {
  return date.toISOString();
}

function publicStamp(date = new Date()) {
  return {
    date: date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }),
    iso: date.toISOString(),
  };
}

const MAX_ACTIVITY = 500;

export const activityLog = {
  entries: [],

  record(type, detail = {}) {
    this.entries.push({
      at: isoNow(),
      type,
      detail,
    });
    if (this.entries.length > MAX_ACTIVITY) {
      this.entries.splice(0, this.entries.length - MAX_ACTIVITY);
    }
  },

  getAll() {
    return this.entries;
  },
};

export const sessionStore = {
  email: '',
  selectedLanguage: 'en',
  savedAt: null,

  save({ email, selectedLanguage }) {
    this.email = email || '';
    this.selectedLanguage = selectedLanguage || 'en';
    this.savedAt = publicStamp();
    activityLog.record('session.saved', { email: this.email });
  },

  getPublic() {
    return {
      email: this.email,
      selectedLanguage: this.selectedLanguage,
      savedAt: this.savedAt,
    };
  },
};

export const accountStore = {
  firstName: '',
  lastName: '',
  gender: '',
  birthDate: '',
  passwordSet: false,
  savedAt: null,

  save({ firstName, lastName, gender, birthDate, passwordTyped }) {
    this.firstName = firstName || '';
    this.lastName = lastName || '';
    this.gender = gender || '';
    this.birthDate = birthDate || '';
    this.passwordSet = Boolean(passwordTyped);
    this.savedAt = publicStamp();
    activityLog.record('account.saved', {
      firstName: this.firstName,
      lastName: this.lastName,
    });
  },

  getPublic() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      gender: this.gender,
      birthDate: this.birthDate,
      passwordSet: this.passwordSet,
      savedAt: this.savedAt,
    };
  },
};

function serializeMedication(list) {
  if (!list) {
    return null;
  }
  return {
    id: list.id,
    productName: list.productName || '',
    unit: list.unit || '',
    modalFrequency: list.modalFrequency || '',
    importantInfo: list.importantInfo || '',
    startDate: list.startAndEndDatesClass?.startDate || null,
    endDate: list.startAndEndDatesClass?.endDate || null,
    createdOn: list.createdOn || null,
    createdAt: list.createdAt || null,
  };
}

export const medicationsStore = {
  items: [],

  replaceAll(lists) {
    this.items = (lists || []).map(serializeMedication).filter(Boolean);
  },

  getAll() {
    return this.items;
  },

  getById(id) {
    return this.items.find((item) => item.id === id) || null;
  },
};

export const userAppState = {
  schemaVersion: 1,

  toBackendPayload() {
    const { medicationHistory } = require('./medicationDoseActions');
    return {
      schemaVersion: this.schemaVersion,
      exportedAt: isoNow(),
      session: sessionStore.getPublic(),
      account: accountStore.getPublic(),
      medications: medicationsStore.getAll(),
      medicationHistory: {
        lists: medicationHistory.lists,
        doseEvents: medicationHistory.doseEvents,
      },
      activity: activityLog.getAll(),
    };
  },

  toJSONString() {
    return JSON.stringify(this.toBackendPayload());
  },

  debugLog() {
    console.log('[UserAppState] backend payload');
    console.log(this.toJSONString());
  },
};
