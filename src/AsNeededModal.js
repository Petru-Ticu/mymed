import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, TextInput, Modal, StyleSheet } from 'react-native';
import ModalsReminders from './ModalsReminders';
import { MAX_NUM_OF_MEDS, ERROR_MESSAGES_MODS_REMS } from './constants';
import FrequencyModalLayout from './FrequencyModalLayout';
import {
  saveFrequencyDraft,
  getFrequencyDraft,
  saveFrequencyDone,
  getFrequencyDone,
} from './frequencyDraft';
import { sanitizeDoseCount } from './utils/doseCountInput';
import { inventoryValue } from './utils/frequencyParse';

export default function AsNeededModal({
  asNeededModalVisible,
  setAsNeededModalVisible,
  handleMaxDailyDoseChange,
  maxDailyDoseAsNeeded,
  handleDonePress,
  handleAsNeededChanges,
  setAsNeededDetails,
  handleResetSelectedFrequency,
  initialAmount,
  initialThreshold,
}) {
    const modalNameAsNeeded = "AsNeeded (PRM)";
    const [maxDoseErrorAsNeeded, setMaxDoseErrorAsNeeded] = useState('');
    const [amountAsNeeded, setAmountAsNeeded] = useState('');
    const [thresholdAsNeeded, setThresholdAsNeeded] = useState('');
    const [isSelectedAsNeeded, setIsSelectedAsNeeded] = useState(false);
    const modalsRemindersRef = useRef();

    useEffect(() => {
        if (!asNeededModalVisible) {
            return;
        }
        const amount = inventoryValue(initialAmount);
        const threshold = inventoryValue(initialThreshold);
        if (amount) {
            setAmountAsNeeded(amount);
        }
        if (threshold) {
            setThresholdAsNeeded(threshold);
        }
        if (amount || threshold) {
            setIsSelectedAsNeeded(true);
        }
    }, [asNeededModalVisible]);
    
    const handleMaxDailyDoseInputChange = (value) => {
        const { next, blocked, invalid } = sanitizeDoseCount(value);
        if (blocked) {
            return;
        }
        if (next && !invalid) {
            handleMaxDailyDoseChange(next);
            setMaxDoseErrorAsNeeded('');
        } else {
            setMaxDoseErrorAsNeeded(MAX_NUM_OF_MEDS.maxMedsNum);
            handleMaxDailyDoseChange('');
        }
    };

const handleBackPressAsNeeded = useCallback(() => {
    const { id, data } = getFrequencyDraft();
    const lastConfirmedDoneBtnModal = getFrequencyDone();
    if (lastConfirmedDoneBtnModal === undefined && (id === undefined || data === undefined)) {
        handleResetSelectedFrequency();
    }

    setAsNeededModalVisible(false);
}, [setAsNeededModalVisible, handleResetSelectedFrequency]);

   
    //checks what has the user done in the modal after he presses the done button
    const onDonePressAsNeeded = () => {

        if (!maxDailyDoseAsNeeded) {
            setMaxDoseErrorAsNeeded(MAX_NUM_OF_MEDS.maxMedsNum);
            return;
        }
        

        if (modalsRemindersRef.current.areThereValidationErrors()) {
            return;
        }


        const asNeededClass = (() => {

            const now = new Date();

            return {
                modalName: modalNameAsNeeded,
                timeCreatedAsNeeded: {
                    date: now.toLocaleDateString('en-GB', {
                        weekday: 'long',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }),
                    time: now.toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    }) + '.' + now.getMilliseconds().toString().padStart(3, '0')
                },
             maxNumPills: maxDailyDoseAsNeeded,
             AmountAsNeeded: isSelectedAsNeeded ? amountAsNeeded : "Null",
             ThresholdAsNeeded: isSelectedAsNeeded ? thresholdAsNeeded : "Null",
        };
        })();

        saveFrequencyDraft('asNeeded', asNeededClass);
        saveFrequencyDone('asNeeded');
        handleDonePress(asNeededClass);
        handleAsNeededChanges(asNeededClass);
        setAsNeededDetails(asNeededClass);


       
            setAsNeededModalVisible(false);

        console.log("\n<--------------------------------------------------------------------------------------------------------------\n",
        "console log for the asNeededClass from the AsNeededModal.js file\n this is the asNeededClass right now:\n", asNeededClass, 
        "\n<--------------------------------------------------------------------------------------------------------------\n"
        );
        //console.log(asNeededClass);
    };
        

    


    
return (
    <Modal 
     visible={asNeededModalVisible}
     transparent
     onRequestClose={handleBackPressAsNeeded}
    >
        <FrequencyModalLayout
            title="Necessary Questions"
            onBackPress={handleBackPressAsNeeded}
            onDonePress={onDonePressAsNeeded}
        >
            <Text style={styles.modalQuestion}>What is the maximum number of pills, drops, etc. that you can take daily?</Text>
            <TextInput
                style={[styles.smallInput, {borderColor: maxDoseErrorAsNeeded ? 'red' : "#000000", borderWidth: maxDoseErrorAsNeeded ? 2 : 1}]}
                onChangeText={handleMaxDailyDoseInputChange}
                value={maxDailyDoseAsNeeded}
                keyboardType="number-pad"
                maxLength={2}
            />
            <View style={styles.errorContainerMaxNumAsNeeded}>
                {maxDoseErrorAsNeeded && <Text style={[styles.errorText, {
                    color: maxDoseErrorAsNeeded ? 'red' : 'trasparent',
                }]}>{maxDoseErrorAsNeeded}</Text>}
            </View>
            <ModalsReminders
                activeModal="asNeeded"
                onAmountChangeAsNeeded={setAmountAsNeeded}
                onThresholdChangeAsNeeded={setThresholdAsNeeded}
                amountAsNeeded={amountAsNeeded}
                thresholdAsNeeded={thresholdAsNeeded}
                ERROR_MESSAGES_MODS_REMS={ERROR_MESSAGES_MODS_REMS}
                isSelectedAsNeeded={isSelectedAsNeeded}
                setIsSelectedAsNeeded={setIsSelectedAsNeeded}
                maxDailyDoseAsNeeded={maxDailyDoseAsNeeded}
                setMaxDoseErrorAsNeeded={setMaxDoseErrorAsNeeded}
                ref={modalsRemindersRef}
            />
        </FrequencyModalLayout>
    </Modal>
);
}

const styles = StyleSheet.create({
    modalQuestion: {
        fontSize: 16,
        marginTop: 30,
        marginBottom: 10,
    },
    smallInput: {
        borderWidth: 1,
        backgroundColor: '#ffffff',
        borderColor: '#000000',
        borderRadius: 10,
        padding: 10,
        width: 60,
        margin: 10,
    },
    errorText: {
        fontSize: 14,
        marginLeft: 10,
        marginTop: 4,
    },
    errorContainerMaxNumAsNeeded: {
        height: 38.7,
    },
});

