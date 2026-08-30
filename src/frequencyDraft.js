// Last frequency modal the user confirmed with Done. Used so Back can keep or reset the label.

let lastDraft = {
  id: undefined,
  data: undefined,
};

let lastDoneModal = undefined;

export function saveFrequencyDraft(id, data) {
  lastDraft = { id, data };
}

export function getFrequencyDraft() {
  return lastDraft;
}

export function saveFrequencyDone(id) {
  lastDoneModal = id;
}

export function getFrequencyDone() {
  return lastDoneModal;
}

export function resetFrequencyDraft() {
  lastDraft = { id: undefined, data: undefined };
  lastDoneModal = undefined;
}
