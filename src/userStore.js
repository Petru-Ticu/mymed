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

function asLanguageCode(value) {
  if (!value) {
    return 'en';
  }
  if (typeof value === 'string') {
    return value;
  }
  return value.code || 'en';
}

export const sessionStore = {
  email: '',
  selectedLanguage: 'en',
  password: '',
  notifyOneMinuteBefore: true,
  savedAt: null,

  save(fields = {}) {
    if (fields.email !== undefined) {
      this.email = fields.email || '';
    }
    if (fields.selectedLanguage !== undefined) {
      this.selectedLanguage = asLanguageCode(fields.selectedLanguage);
    }
    if (fields.password !== undefined) {
      this.password = fields.password || '';
    }
    if (fields.notifyOneMinuteBefore !== undefined) {
      this.notifyOneMinuteBefore = Boolean(fields.notifyOneMinuteBefore);
    }
    this.savedAt = publicStamp();
    activityLog.record('session.saved', { email: this.email });
    notifyUserStore();
  },

  clearIdentity() {
    this.email = '';
    this.password = '';
    this.notifyOneMinuteBefore = true;
    this.savedAt = null;
    activityLog.record('session.signedOut', {});
    notifyUserStore();
  },

  getPublic() {
    return {
      email: this.email,
      selectedLanguage: this.selectedLanguage,
      notifyOneMinuteBefore: this.notifyOneMinuteBefore,
      savedAt: this.savedAt,
    };
  },
};

const userStoreListeners = new Set();

function notifyUserStore() {
  userStoreListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // A bad subscriber must not take down account save.
    }
  });
}

export function subscribeUserStore(listener) {
  userStoreListeners.add(listener);
  return () => userStoreListeners.delete(listener);
}

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
    if (passwordTyped !== undefined) {
      this.passwordSet = Boolean(passwordTyped);
    }
    this.savedAt = publicStamp();
    activityLog.record('account.saved', {
      firstName: this.firstName,
      lastName: this.lastName,
    });
    notifyUserStore();
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

  clear() {
    this.firstName = '';
    this.lastName = '';
    this.gender = '';
    this.birthDate = '';
    this.passwordSet = false;
    this.savedAt = null;
    notifyUserStore();
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
};
