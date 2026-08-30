import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMedicalList } from './MedicalListContext';
import { colors } from './theme/colors';
import { formatProductNames } from './utils/text';
import { sanitizeDoseCount } from './utils/doseCountInput';
import { getActiveRouteName } from './navigation/navigationRef';
import { classifyInventory } from './frequencyHandlers';
import { lastAsNeededStep } from './notificationItems';
import {
  notifyInventoryOnPhone,
  syncScheduledDoseAlerts,
} from './phoneAlerts';
import {
  applyAsNeededTake,
  applyScheduledAnswer,
  collectDueDoses,
  extractTimesFromFrequency,
  markScheduledFired,
} from './medicationDoseActions';

const SILENT_ROUTES = new Set(['Welcome', 'Language_Selector']);

const DoseActionsContext = createContext({
  openAsNeededTake: () => {},
  promptScheduledDose: () => {},
});

export function useDoseActions() {
  return useContext(DoseActionsContext);
}

function ActionModal({ visible, title, children, buttons }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <Text style={styles.title}>{title}</Text>
          {children}
          <View style={styles.buttonRow}>
            {buttons.map((button) => (
              <TouchableOpacity
                key={button.label}
                style={[styles.choiceButton, { backgroundColor: button.color }]}
                onPress={button.onPress}
              >
                <Text style={[styles.choiceText, button.textColor ? { color: button.textColor } : null]}>
                  {button.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function DoseReminderHost({ children }) {
  const { medicalLists, setMedicalLists } = useMedicalList();

  const [queue, setQueue] = useState([]);
  const [asNeededList, setAsNeededList] = useState(null);
  const [asNeededStep, setAsNeededStep] = useState('confirm');
  const [asNeededQty, setAsNeededQty] = useState('');
  const [approachWarnings, setApproachWarnings] = useState([]);
  const [refillWarnings, setRefillWarnings] = useState([]);
  const [emptyWarnings, setEmptyWarnings] = useState([]);

  const listsRef = useRef(medicalLists);
  listsRef.current = medicalLists;
  const queueRef = useRef(queue);
  queueRef.current = queue;
  const dismissedRef = useRef({});
  const phonedRef = useRef(new Set());

  const presentInventoryAlerts = useCallback((lists) => {
    const approaching = [];
    const low = [];
    const empty = [];
    (lists || []).forEach((list) => {
      if (!list?.id) {
        return;
      }
      const warning = classifyInventory(list, new Date(), lastAsNeededStep(list.id));
      if (!warning) {
        delete dismissedRef.current[list.id];
        ['approaching', 'atThreshold', 'empty'].forEach((level) => {
          phonedRef.current.delete(`${list.id}:${level}`);
        });
        return;
      }
      if (dismissedRef.current[list.id] === warning.level) {
        return;
      }
      if (warning.level === 'empty') {
        empty.push(warning);
      } else if (warning.level === 'atThreshold') {
        low.push(warning);
      } else if (warning.level === 'approaching') {
        approaching.push(warning);
      }
    });
    const pushNew = (next, setter) => {
      if (!next.length) {
        return;
      }
      setter(next);
      next.forEach((warning) => {
        const phoneKey = `${warning.list.id}:${warning.level}`;
        if (phonedRef.current.has(phoneKey)) {
          return;
        }
        phonedRef.current.add(phoneKey);
        notifyInventoryOnPhone(warning);
      });
    };
    if (empty.length) {
      pushNew(empty, setEmptyWarnings);
    } else if (low.length) {
      pushNew(low, setRefillWarnings);
    } else if (approaching.length) {
      pushNew(approaching, setApproachWarnings);
    }
  }, []);

  const [activeRoute, setActiveRoute] = useState(null);
  const remindersAllowed = Boolean(activeRoute) && !SILENT_ROUTES.has(activeRoute);

  useEffect(() => {
    let lastLoggedMinute = '';
    const timer = setInterval(() => {
      const routeName = getActiveRouteName();
      setActiveRoute((prev) => (prev === routeName ? prev : routeName));
      // Only Welcome / language select are silent. If the route is unknown, still fire.
      const onSilentScreen = SILENT_ROUTES.has(routeName);
      if (onSilentScreen) {
        return;
      }
      const now = new Date();
      const clock = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const due = collectDueDoses(listsRef.current, now);
      if (clock !== lastLoggedMinute) {
        lastLoggedMinute = clock;
        console.log('[MedicationDose] clock check', {
          routeName,
          clock,
          lists: listsRef.current.length,
          due: due.length,
          slots: listsRef.current.map((list) => ({
            name: list.productName,
            times: extractTimesFromFrequency(list.modalFrequency).map((slot) => slot.time),
            dates: {
              start: list.startAndEndDatesClass?.startDate || null,
              end: list.startAndEndDatesClass?.endDate || null,
            },
          })),
        });
      }
      if (!due.length) {
        return;
      }
      const queuedKeys = new Set(queueRef.current.map((item) => item.key));
      const fresh = due.filter((item) => !queuedKeys.has(item.key));
      if (!fresh.length) {
        return;
      }
      fresh.forEach((item) => {
        markScheduledFired(item.key);
        console.log('[MedicationDose] queued scheduled reminder', item);
      });
      setQueue((prev) => [...prev, ...fresh]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!remindersAllowed) {
      return;
    }
    presentInventoryAlerts(medicalLists);
    syncScheduledDoseAlerts(medicalLists);
  }, [medicalLists, presentInventoryAlerts, remindersAllowed]);

  const current = remindersAllowed ? queue[0] : null;

  const answerScheduled = (tookIt) => {
    if (!current) {
      return;
    }
    console.log('[MedicationDose] scheduled answer', { tookIt, current });
    const result = applyScheduledAnswer(listsRef.current, current, tookIt);
    setMedicalLists(result.nextLists);
    presentInventoryAlerts(result.nextLists);
    setQueue((prev) => prev.slice(1));
  };

  const openAsNeededTake = useCallback((list) => {
    setAsNeededList(list);
    setAsNeededStep('confirm');
    setAsNeededQty('');
    console.log('[MedicationDose] opened As Needed take', { id: list?.id, name: list?.productName });
  }, []);

  const promptScheduledDose = useCallback((item) => {
    if (!item?.key) {
      return;
    }
    markScheduledFired(item.key);
    setQueue((prev) => {
      if (prev.some((queued) => queued.key === item.key)) {
        const next = prev.filter((queued) => queued.key !== item.key);
        return [item, ...next];
      }
      return [item, ...prev];
    });
    console.log('[MedicationDose] prompted scheduled dose from notifications', item);
  }, []);

  const closeAsNeeded = () => {
    setAsNeededList(null);
    setAsNeededStep('confirm');
    setAsNeededQty('');
  };

  const confirmAsNeededYes = () => {
    setAsNeededStep('quantity');
  };

  const confirmAsNeededOk = () => {
    const qty = Number(asNeededQty);
    if (!qty) {
      return;
    }
    console.log('[MedicationDose] As Needed OK', { name: asNeededList.productName, qty });
    const result = applyAsNeededTake(listsRef.current, asNeededList, qty);
    setMedicalLists(result.nextLists);
    presentInventoryAlerts(result.nextLists);
    closeAsNeeded();
  };

  const showScheduled = Boolean(remindersAllowed && current && !asNeededList);
  const showAsNeeded = Boolean(asNeededList);
  const refillVisible = refillWarnings.length > 0 && !showScheduled && !showAsNeeded;
  const emptyVisible = emptyWarnings.length > 0 && !showScheduled && !showAsNeeded && !refillVisible;
  const approachVisible = approachWarnings.length > 0 && !showScheduled && !showAsNeeded && !refillVisible && !emptyVisible;

  const dismissWarnings = (warnings, setter) => {
    warnings.forEach((warning) => {
      if (warning.list?.id) {
        dismissedRef.current[warning.list.id] = warning.level;
      }
    });
    setter([]);
  };

  const unit = current?.unit || 'unit(s)';
  const scheduledTitle = current
    ? `Take ${current.quantity} ${unit} of ${current.productName}!`
    : '';

  return (
    <DoseActionsContext.Provider value={{ openAsNeededTake, promptScheduledDose }}>
      {children}
      <ActionModal
        visible={showScheduled}
        title={scheduledTitle}
        buttons={[
          { label: 'OK', color: '#5CA65C', onPress: () => answerScheduled(true) },
          { label: 'NO', color: '#E53935', onPress: () => answerScheduled(false) },
        ]}
      />

      <ActionModal
        visible={showAsNeeded && asNeededStep === 'confirm'}
        title={`You want to take ${asNeededList?.productName}?`}
        buttons={[
          { label: 'YES', color: '#5CA65C', onPress: confirmAsNeededYes },
          { label: 'NO', color: '#E53935', onPress: closeAsNeeded },
        ]}
      />

      <ActionModal
        visible={showAsNeeded && asNeededStep === 'quantity'}
        title={`How many ${asNeededList?.productName} you want to take?`}
        buttons={[
          { label: 'OK', color: '#5CA65C', onPress: confirmAsNeededOk },
          { label: 'CANCEL', color: '#E53935', onPress: closeAsNeeded },
        ]}
      >
        <TextInput
          style={styles.qtyInput}
          value={asNeededQty}
          keyboardType="number-pad"
          maxLength={2}
          placeholder="1-99"
          placeholderTextColor={colors.text}
          onChangeText={(text) => {
            const { next, blocked } = sanitizeDoseCount(text);
            if (blocked || next == null) {
              return;
            }
            setAsNeededQty(next);
          }}
        />
      </ActionModal>

      <ActionModal
        visible={approachVisible}
        title={`${formatProductNames(approachWarnings.map((item) => item.name))} is two doses away from your refill point. Please plan to get more.`}
        buttons={[{
          label: 'OK',
          color: colors.accent,
          textColor: colors.text,
          onPress: () => dismissWarnings(approachWarnings, setApproachWarnings),
        }]}
      />

      <ActionModal
        visible={refillVisible}
        title={`You need to get more Meds into your ${formatProductNames(refillWarnings.map((item) => item.name))} Inventory!`}
        buttons={[{
          label: 'OK',
          color: colors.accent,
          textColor: colors.text,
          onPress: () => dismissWarnings(refillWarnings, setRefillWarnings),
        }]}
      />

      <ActionModal
        visible={emptyVisible}
        title={`You need to add med/s to your Inventory because the ${formatProductNames(emptyWarnings.map((item) => item.name))} are empty!`}
        buttons={[{
          label: 'OK',
          color: colors.accent,
          textColor: colors.text,
          onPress: () => dismissWarnings(emptyWarnings, setEmptyWarnings),
        }]}
      />
    </DoseActionsContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  panel: {
    width: '88%',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 22,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  choiceButton: {
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  choiceText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtyInput: {
    width: 80,
    height: 44,
    borderWidth: 1,
    borderColor: colors.text,
    backgroundColor: colors.white,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 8,
    color: colors.text,
  },
});
