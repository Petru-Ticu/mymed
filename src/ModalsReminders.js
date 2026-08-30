import React, { useState, useEffect, useImperativeHandle, forwardRef  } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MAX_NUM_OF_MEDS, ERROR_MESSAGES_MODS_REMS, ERRORS_DAILY_X_TIMES_A_DAY } from './constants';
import { styles } from './ModalsReminders.styles';
import {
  amountAtOrBelowThreshold,
  amountBelowOther,
  isEmptyOrLeadingZero,
} from './utils/inputRules';



const ModalsReminders = forwardRef(({
     onAmountChangeAsNeeded, onThresholdChangeAsNeeded, amountAsNeeded, thresholdAsNeeded, isSelectedAsNeeded, setIsSelectedAsNeeded, //variables from the file AsNeededModal.js
     maxDailyDoseAsNeeded, setMaxDoseErrorAsNeeded, //variables from the file AsNeededModal.js

     onAmountChangeDXTAD, onThresholdChangeDXTAD, amountDXTAD, totalMedsIntake, thresholdDXTAD, isSelectedDXTAD, setIsSelectedDXTAD, //variables from the file DailyXTimesADayModal.js
     inputValueTimesPerDayDXTAD, setInputTimesValuesError, //variables from the file DailyXTimesADayModal.js

     activeModal,
    }, ref) => {

        const [hasUserInteractedWithAmount, setHasUserInteractedWithAmount] = useState(false); //checks to see if the user has interacted with the amount filed
        const [hasUserInteractedWithThreshold, setHasUserInteractedWithThreshold] = useState(false); //checks to see if the user has interacted with the threshold field

        const [amountError, setAmountError] = useState(''); //triggers the amount error when it needs to.
        const [thresholdError, setThresholdError] = useState(''); //triggers the threshold error when it needs to.
        const [inventoryError, setInventoryError] = useState(''); //triggers the inventory error when it needs to.
        const [amountGreaterThanMaxDoseError, setAmountGreaterThanMaxDoseError] = useState(''); //triggers the amount greater than the maxDailyDose error when it needs to.
        const [amountSmallerThanMaxNumMedsError, setAmountSmallerThanMaxNumMedsError] = useState('');
        
        // Validates user inputs for amount and threshold in the context of the selected reminders.
        // Sets error messages for invalid or illogical inputs, such as amounts or thresholds that start with zero,
        // amounts exceeding thresholds, or amounts less than the max daily dose.
        // It updates component state with the relevant error messages for display to the user.
        const validateInputsOfModals = () => {
            let newAmountError = '';
            let newAmountGreaterThanMaxDoseError = '';
            let newAmountSmallerThanTotalMedsSum = ''; 
            let newThresholdError = '';
            let newInventoryError = '';
        
            //Start of the asNeeded modal part.
            if (activeModal === "asNeeded" && isSelectedAsNeeded) {
                newAmountError = isEmptyOrLeadingZero(amountAsNeeded) ? ERROR_MESSAGES_MODS_REMS.validAmount : '';
                newThresholdError = isEmptyOrLeadingZero(thresholdAsNeeded) ? ERROR_MESSAGES_MODS_REMS.validThreshold : '';
                newInventoryError = amountAtOrBelowThreshold(amountAsNeeded, thresholdAsNeeded) ? ERROR_MESSAGES_MODS_REMS.amountGreaterThanThreshold : '';
                newAmountGreaterThanMaxDoseError = amountBelowOther(amountAsNeeded, maxDailyDoseAsNeeded) ? MAX_NUM_OF_MEDS.amountSmallerThanMaxNumMeds : '';

                if (isEmptyOrLeadingZero(amountAsNeeded)) {
                    setAmountError(ERROR_MESSAGES_MODS_REMS.validAmount);
                } else {
                    setAmountError('');
                }

                if (isEmptyOrLeadingZero(thresholdAsNeeded)) {
                    setThresholdError(ERROR_MESSAGES_MODS_REMS.validThreshold);
                } else {
                    setThresholdError('');
                }
        
                if (amountBelowOther(amountAsNeeded, maxDailyDoseAsNeeded)) {
                   setAmountGreaterThanMaxDoseError(MAX_NUM_OF_MEDS.amountSmallerThanMaxNumMeds);
                } else {
                    setAmountGreaterThanMaxDoseError('');
                }

                if (amountAtOrBelowThreshold(amountAsNeeded, thresholdAsNeeded)) {
                    setInventoryError(MAX_NUM_OF_MEDS.amountGreaterThanThreshold);
                } else {
                    setInventoryError('');
                } 
            

            setAmountError(newAmountError);
            setAmountGreaterThanMaxDoseError(newAmountGreaterThanMaxDoseError);
            setThresholdError(newThresholdError);
            setInventoryError(newInventoryError);

            } 
            
            //End of the asNeeded modal part.
            //Start of the dailyXTimesADay modal.
            if (activeModal === "dailyXTimesADay" && isSelectedDXTAD) {
                newAmountError = isEmptyOrLeadingZero(amountDXTAD) ? ERROR_MESSAGES_MODS_REMS.validAmount : '';
                newThresholdError = isEmptyOrLeadingZero(thresholdDXTAD) ? ERROR_MESSAGES_MODS_REMS.validThreshold : '';
                newInventoryError = amountAtOrBelowThreshold(amountDXTAD, thresholdDXTAD) ? ERROR_MESSAGES_MODS_REMS.amountGreaterThanThreshold : '';
                //newAmountGreaterThanMaxDoseError = amountDXTAD && inputValueTimesPerDayDXTAD && parseInt(amountDXTAD) < parseInt(inputValueTimesPerDayDXTAD) ? MAX_NUM_OF_MEDS.amountSmallerThanMaxNumMeds : '';
                newAmountSmallerThanTotalMedsSum = amountBelowOther(amountDXTAD, totalMedsIntake) ? ERRORS_DAILY_X_TIMES_A_DAY.amountSmallerThanTotalMedsSum : '';

                if (isEmptyOrLeadingZero(amountDXTAD)) {
                    setAmountError(ERROR_MESSAGES_MODS_REMS.validAmount);
                } else {
                    setAmountError('');
                }

                if (isEmptyOrLeadingZero(thresholdDXTAD)) {
                    setThresholdError(ERROR_MESSAGES_MODS_REMS.validThreshold);
                } else {
                    setThresholdError('');
                }


                if (amountAtOrBelowThreshold(amountDXTAD, thresholdDXTAD)) {
                    setInventoryError(ERROR_MESSAGES_MODS_REMS.amountGreaterThanThreshold);
                } else {
                    setInventoryError('');
                }


                // if (isSelectedDXTAD && amountDXTAD && inputValueTimesPerDayDXTAD && parseInt(amountDXTAD) < parseInt(inputValueTimesPerDayDXTAD)) {
                //     setAmountGreaterThanMaxDoseError(MAX_NUM_OF_MEDS.amountSmallerThanMaxNumMeds);
                // } else {
                //     setAmountGreaterThanMaxDoseError('');
                // }

                if (isSelectedDXTAD && amountDXTAD && totalMedsIntake && parseInt(amountDXTAD) < parseInt(totalMedsIntake)) {
                    setAmountSmallerThanMaxNumMedsError(ERRORS_DAILY_X_TIMES_A_DAY.amountSmallerThanTotalMedsSum);
                } else {
                    setAmountSmallerThanMaxNumMedsError('');
                }
    
    
                setAmountError(newAmountError);
                //setAmountGreaterThanMaxDoseError(newAmountGreaterThanMaxDoseError);
                setAmountSmallerThanMaxNumMedsError(newAmountSmallerThanTotalMedsSum);
                setThresholdError(newThresholdError);
                setInventoryError(newInventoryError);
            }
            //End of the dailyXTimesADay modal.
        };
        

    
    // This function manages the reminder selection state and validates user inputs for amount and threshold
    // when the reminder is selected. It clears error messages when reminders are deselected and applies 
    // validations when selected, ensuring the inputs make logical sense (e.g., amount does not start with zero,
    // amount is not less than the threshold) and are appropriate for the context of enabling reminders.
    const handleSelectionChangeAsNeeded = (selected) => {
        if (activeModal === "asNeeded") {
        setIsSelectedAsNeeded(selected);
        //setIsSelectedDXTAD(selected);
      
        if (!selected) {
          setAmountError('');
          setThresholdError('');
          setInventoryError('');
          setAmountGreaterThanMaxDoseError('');
         } 
    }
    
    validateInputsOfModals();
      };

      const handleSelectionChangeDXTAD = (selected) => {
        if (activeModal === "dailyXTimesADay") {
        setIsSelectedDXTAD(selected);

        if (!selected) {
            setAmountError('');
            setThresholdError('');
            setInventoryError('');
            //setAmountGreaterThanMaxDoseError('');
            setAmountSmallerThanMaxNumMedsError('');
        }

        validateInputsOfModals();
    }
      };

      const handleSelectionChange = (selected) => {
        if (activeModal === "asNeeded") {
            handleSelectionChangeAsNeeded(selected);
        } else if (activeModal === "dailyXTimesADay") {
            handleSelectionChangeDXTAD(selected);
        }
    };

    

    
    // Handles changes to 'amountAsNeeded' and 'thresholdAsNeeded' inputs, validating them
    // against rules for starting with a non-zero number or being empty. It updates the 
    //respective state and error messages based on validation results. For 'amountAsNeeded',
    // it ensures the value is not less than the threshold, and vice versa for 'thresholdAsNeeded'.
    // Additionally, it invokes comprehensive validation to maintain logical consistency across
    // inputs and updates related error states.
    const handleInputChange = (type, value) => {

        const userInteractedAsNeeded = type === 'amountAsNeeded' ? setHasUserInteractedWithAmount : setHasUserInteractedWithThreshold;
    userInteractedAsNeeded(true); 

        const userInteractedDXTAD = type === 'amountDXTAD' ? setHasUserInteractedWithAmount : setHasUserInteractedWithThreshold;
    userInteractedDXTAD(true);
    

    validateInputsOfModals()

    //Start of the asNeeded part of this function.
        if (/^([1-9][0-9]*|)$/.test(value)) { 
            if (type === 'amountAsNeeded') {
                setHasUserInteractedWithAmount(true);
                if (onAmountChangeAsNeeded) {
                onAmountChangeAsNeeded(value);
                }
                if (isEmptyOrLeadingZero(value)) {
                    setAmountError(ERROR_MESSAGES_MODS_REMS.validAmount);
                } else {
                    setAmountError('');
                } 
                if (isSelectedAsNeeded && amountAtOrBelowThreshold(value, thresholdAsNeeded)) {
                    setAmountError(ERROR_MESSAGES_MODS_REMS.amountGreaterThanThreshold);
                } else {
                    setAmountError('');
                }
            } else if (type === 'thresholdAsNeeded') {
                setHasUserInteractedWithThreshold(true);
                if (onThresholdChangeAsNeeded) {
                onThresholdChangeAsNeeded(value);
                }
                if (isEmptyOrLeadingZero(value)) {
                    setThresholdError(ERROR_MESSAGES_MODS_REMS.validThreshold);
                } else {
                    setThresholdError('');
                }
            }
    
            if (type === 'amountAsNeeded' && amountAtOrBelowThreshold(value, thresholdAsNeeded)) {
                setInventoryError(ERROR_MESSAGES_MODS_REMS.amountGreaterThanThreshold);
            } else if (type === 'thresholdAsNeeded' && amountAsNeeded && parseInt(value) < parseInt(amountAsNeeded)) {
                setInventoryError(''); 
              }

            if (type === 'amountAsNeeded' && amountBelowOther(value, maxDailyDoseAsNeeded)) {
                setAmountGreaterThanMaxDoseError(MAX_NUM_OF_MEDS.amountSmallerThanMaxNumMeds);
            } else if (type === 'maxDailyDoseAsNeeded' && amountAsNeeded && parseInt(value) > parseInt(amountAsNeeded)) {
                setAmountGreaterThanMaxDoseError('');
            }
            
            
        }
    //End of the asNeeded part of this function.
    //Start of the dailyXTimesADay part of this function.
    if (/^([1-9][0-9]*|)$/.test(value)) { 
        if (type === 'amountDXTAD') {
            setHasUserInteractedWithAmount(true);
            onAmountChangeDXTAD(value);
            if (isEmptyOrLeadingZero(value)) {
                setAmountError(ERROR_MESSAGES_MODS_REMS.validAmount);
            } else {
                setAmountError('');
            }
        } else if (type === 'thresholdDXTAD') {
            setHasUserInteractedWithThreshold(true);
            onThresholdChangeDXTAD(value);
            if (isEmptyOrLeadingZero(value)) {
                setThresholdError(ERROR_MESSAGES_MODS_REMS.validThreshold);
            } else {
                setThresholdError('');
            }
        }

        if (type === 'amountDXTAD' && amountAtOrBelowThreshold(value, thresholdDXTAD)) {
            setInventoryError(ERROR_MESSAGES_MODS_REMS.amountGreaterThanThreshold);
        } else if (type === 'thresholdDXTAD' && amountDXTAD && parseInt(value) < parseInt(amountDXTAD)) {
            setInventoryError('');
        }

        if (type === 'amountDailyXTimesADay' && amountBelowOther(value, totalMedsIntake)) {
            setAmountSmallerThanMaxNumMedsError(MAX_NUM_OF_MEDS.amountSmallerThanMaxNumMeds);
        } else if (type === 'totalMedsIntake' && amountDXTAD && parseInt(value) > parseInt(amountDXTAD)) {
            setAmountSmallerThanMaxNumMedsError('');
        }
    }
        
    
    };
    
    
    // Automatically validates form inputs whenever there's a change in the input values (amount or threshold),
    // the reminder selection state, or user interaction flags. This ensures that validation feedback is immediately
    // updated in response to user actions, maintaining accurate and responsive error messaging. It optimizes the user
    // experience by providing real-time validation feedback without unnecessary performance overhead, as it only triggers
    // validation when relevant state changes occur.
    useEffect(() => {
        validateInputsOfModals();
      }, [activeModal, amountAsNeeded, maxDailyDoseAsNeeded, thresholdAsNeeded, isSelectedAsNeeded, hasUserInteractedWithAmount, hasUserInteractedWithThreshold,  //asNeeded variables
          amountDXTAD, thresholdDXTAD, totalMedsIntake, isSelectedDXTAD, inputValueTimesPerDayDXTAD]); //dailyXTimeaADay variables
      
      

    //this function prepares the data to be saved and dispalyed in the frequency box in the 
    //MedicationTypingPage.js file and also chekcs to see if they are any wrong or empty fields
    const handleDone = () => {
    //Start of the asNeeded done button validation.
        validateInputsOfModals(); 

        let isErrorPresent = false;

    // Rule 1: Check if maxDailyDoseAsNeeded is empty or just spaces
    if ((!maxDailyDoseAsNeeded || maxDailyDoseAsNeeded.trim() === '') && setMaxDoseErrorAsNeeded) {
        setMaxDoseErrorAsNeeded(MAX_NUM_OF_MEDS.maxMedsNum);
        isErrorPresent = true;
    }

    // Rule 2: Check if amountAsNeeded is empty when isSelected is true
    if (isSelectedAsNeeded && (!amountAsNeeded || amountAsNeeded.trim() === '')) {
        setAmountError(ERROR_MESSAGES_MODS_REMS.validAmount);
        isErrorPresent = true;
    }

    // Rule 3: Check if thresholdAsNeeded is empty when isSelected is true
    if (isSelectedAsNeeded && (!thresholdAsNeeded || thresholdAsNeeded.trim() === '')) {
        setThresholdError(ERROR_MESSAGES_MODS_REMS.validThreshold);
        isErrorPresent = true;
    }

    // Rule 4: Check if maxDailyDoseAsNeeded is bigger than amountAsNeeded when isSelected is true
    if (isSelectedAsNeeded && amountBelowOther(amountAsNeeded, maxDailyDoseAsNeeded)) {
        setAmountGreaterThanMaxDoseError(MAX_NUM_OF_MEDS.amountSmallerThanMaxNumMeds);
        isErrorPresent = true;
    }

    // Rule 5: Check if amountAsNeeded is equal or smaller than thresholdAsNeeded when isSelected is true
    if (isSelectedAsNeeded && amountAtOrBelowThreshold(amountAsNeeded, thresholdAsNeeded)) {
        setInventoryError(ERROR_MESSAGES_MODS_REMS.amountGreaterThanThreshold);
        isErrorPresent = true;
    }
    //End of the asNeeded done button validation.
    //Start of the DailyXTimesADay done button validation.

    // Rule 1: Check if inputValueTimesPerDayDXTAD is empty or just spaces
    if ((!inputValueTimesPerDayDXTAD || inputValueTimesPerDayDXTAD.trim() === '') && setInputTimesValuesError) {
        setInputTimesValuesError(ERRORS_DAILY_X_TIMES_A_DAY.validMedicineIntake);
        isErrorPresent = true;
    }

    // Rule 2: Check if amountDXTAD is empty when isSelected is true
    if (isSelectedDXTAD && (!amountDXTAD || amountDXTAD.trim() === '')) {
        setAmountError(ERROR_MESSAGES_MODS_REMS.validAmount);
        isErrorPresent = true;
    }

     // Rule 3: Check if thresholdDXTAD is empty when isSelected is true
     if (isSelectedDXTAD && (!thresholdDXTAD || thresholdDXTAD.trim() === '')) {
        setThresholdError(ERROR_MESSAGES_MODS_REMS.validThreshold);
        isErrorPresent = true;
    }

     // Rule 5: Check if amountDXTAD is equal or smaller than thresholdAsNeeded when isSelected is true
    if (isSelectedDXTAD && amountAtOrBelowThreshold(amountDXTAD, thresholdDXTAD)) {
        setInventoryError(ERROR_MESSAGES_MODS_REMS.amountGreaterThanThreshold);
        isErrorPresent = true;
    }

    // if (isSelectedDXTAD && parseInt(amountDXTAD, 10) < parseInt(inputValueTimesPerDayDXTAD, 10)) {
    //     setAmountGreaterThanMaxDoseError(MAX_NUM_OF_MEDS.amountSmallerThanMaxNumMeds);
    //     isErrorPresent = true;
    // }

    if (isSelectedDXTAD && amountBelowOther(amountDXTAD, totalMedsIntake)) {
        setAmountSmallerThanMaxNumMedsError(ERRORS_DAILY_X_TIMES_A_DAY.amountSmallerThanTotalMedsSum);
    }
};
    

    
    // Exposes the `handleDone` function to parent components using a ref.
    // This allows the parent to directly invoke `handleDone`, which performs validations
    // and actions specific to this component, such as checking input validity,
    // and managing state updates based on those validations. It's utilized for
    // tightly controlled interactions between this child component and its parent,
    // enabling a more imperative approach to handle certain operations like form
    // submissions or data processing that depend on child component's state.
    useImperativeHandle(ref, () => ({
        handleDone,

        areThereValidationErrors: () => {
            if (activeModal === "asNeeded") {
                // Check for 'asNeeded' related errors
                return (isSelectedAsNeeded && !!amountError) || (isSelectedAsNeeded && !!thresholdError) || (isSelectedAsNeeded && !!inventoryError) || (isSelectedAsNeeded && !!amountGreaterThanMaxDoseError);
            } else if (activeModal === "dailyXTimesADay") {
                // Check for 'dailyXTimesADay' related errors
                return (isSelectedDXTAD && !!amountError) || (isSelectedDXTAD && !!thresholdError) || (isSelectedDXTAD && !!inventoryError) || (isSelectedDXTAD && !!amountSmallerThanMaxNumMedsError);
            }
            // Return false if none of the above or no active modal is defined
            return false;
        }
    }));
      

    return (
        <View>
            <Text style={styles.modalQuestion}>Do you want to get reminder/s to refill your med/s inventory?</Text>
            <View style={styles.reminderContainer}>
                <Text style={styles.reminderText}>Remind me</Text>
                <TouchableOpacity onPress={() => {
                    if (activeModal === "asNeeded") {
                        handleSelectionChangeAsNeeded(!isSelectedAsNeeded);
                    } else if (activeModal === "dailyXTimesADay") {
                        handleSelectionChangeDXTAD(!isSelectedDXTAD)
                    }
                }} style={styles.checkbox}>
                    {((activeModal === "asNeeded" && isSelectedAsNeeded) || (activeModal === "dailyXTimesADay" && isSelectedDXTAD)) && <Icon name="check" size={26} color="#5CA65C" />}
                </TouchableOpacity>
            </View>
                <View>
                    <Text style={[styles.textRemind, {opacity: (activeModal === "asNeeded" && isSelectedAsNeeded) || (activeModal === "dailyXTimesADay" && isSelectedDXTAD) ? 1 : 0.5}]}>CURRENT INVENTORY FOR YOUR MED/S</Text>
                    <Text style={[styles.textRemind, {opacity: (activeModal === "asNeeded" && isSelectedAsNeeded) || (activeModal === "dailyXTimesADay" && isSelectedDXTAD) ? 1 : 0.5}]}>AMOUNT</Text>
                    <TextInput
    style={[styles.remindFields, 
        ((amountError || inventoryError || amountGreaterThanMaxDoseError || amountSmallerThanMaxNumMedsError) && (isSelectedAsNeeded || isSelectedDXTAD)) ? { borderColor: 'red', borderWidth: 2 } : {},
        {opacity: (activeModal === "asNeeded" && isSelectedAsNeeded) || (activeModal === "dailyXTimesADay" && isSelectedDXTAD) ? 1 : 0.5}]}
    onChangeText={(value) => handleInputChange(activeModal === "asNeeded" ? "amountAsNeeded" : "amountDXTAD", value)}
    value={activeModal === "asNeeded" ? amountAsNeeded : amountDXTAD}
    editable={activeModal === "asNeeded" ? isSelectedAsNeeded : isSelectedDXTAD}
    keyboardType="number-pad"
    maxLength={3}
/>

                    <View style={styles.errorContainerAmount}>
                        {(activeModal === "asNeeded" && amountError && isSelectedAsNeeded) || (activeModal === "dailyXTimesADay" && amountError && isSelectedDXTAD) ? <Text style={[styles.errorText, {
                             color: amountError ? 'red' : 'transparent',
                        }]}>{amountError}</Text> : null}


                        {(activeModal === "asNeeded" && amountGreaterThanMaxDoseError && isSelectedAsNeeded) ? <Text style={[styles.errorText, {
                             color: amountGreaterThanMaxDoseError ? 'red' : 'transparent',
                        }]}>{amountGreaterThanMaxDoseError}</Text> : null}

                        {(activeModal === "dailyXTimesADay" && amountSmallerThanMaxNumMedsError && isSelectedDXTAD) ? <Text style={[styles.errorText, {
                            color: amountSmallerThanMaxNumMedsError ? 'red' : 'transparent',
                        }]}>{amountSmallerThanMaxNumMedsError}</Text> : null}


                        {(activeModal === "asNeeded" && inventoryError && isSelectedAsNeeded) || (activeModal === "dailyXTimesADay" && inventoryError && isSelectedDXTAD) ? <Text style={[styles.errorText, {
                             color: inventoryError ? 'red' : 'transparent',
                        }]}>{inventoryError}</Text> : null}
                    </View>
                    <Text style={[styles.textRemind, {opacity: (activeModal === "asNeeded" && isSelectedAsNeeded) || (activeModal === "dailyXTimesADay" && isSelectedDXTAD) ? 1 : 0.5}]}>THRESHOLD</Text>
                    <TextInput
    style={[styles.remindFields, thresholdError && (isSelectedAsNeeded || isSelectedDXTAD) ? { borderColor: 'red', borderWidth: 2 } : {}, 
        {opacity: (activeModal === "asNeeded" && isSelectedAsNeeded) || (activeModal === "dailyXTimesADay" && isSelectedDXTAD) ? 1 : 0.5}]}
    onChangeText={(value) => handleInputChange(activeModal === "asNeeded" ? "thresholdAsNeeded" : "thresholdDXTAD", value)}
    value={activeModal === "asNeeded" ? thresholdAsNeeded : thresholdDXTAD}
    editable={activeModal === "asNeeded" ? isSelectedAsNeeded : isSelectedDXTAD}
    keyboardType="number-pad"
    maxLength={2}
/>

                    <View style={styles.errorContainerThreshold}>
                    {(activeModal === "asNeeded" && thresholdError && isSelectedAsNeeded) || (activeModal === "dailyXTimesADay" && thresholdError && isSelectedDXTAD) ? <Text style={[styles.errorText, {
                            color: thresholdError ? 'red' : 'transparent',
                    }]}>{thresholdError}</Text> : null}        
                    </View>            
                </View>  
        </View>
    );
});

export default ModalsReminders;
