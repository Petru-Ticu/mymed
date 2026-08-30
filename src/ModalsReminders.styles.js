import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    // ... styles for modalQuestion, reminderContainer, reminderText, checkbox, textRemind, remindFields, errorText ...
    modalQuestion: {
        fontSize: 16,
        marginTop: 14,
        marginBottom: 10,
    },
    reminderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: 24,
    },
    reminderText: {
        fontSize: 20,
        marginRight: 10,
    },
    checkbox: {
        height: 27,
        width: 27,
        backgroundColor: '#ffffff',
        borderColor: '#000000',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    //checkboxUnselected: {
        
    //},
    textRemind: {
        fontWeight: 'bold',
        fontSize: 14.6,
        marginTop: 46,
    },
    remindFields: {
        borderWidth: 1,
        backgroundColor: '#ffffff',
        borderColor: '#000000',
        borderRadius: 10,
        padding: 10,
        width: 60,
        marginTop: 27,
        marginBottom: 10,
    },
    errorText: {
        //color: 'red',
        fontSize: 14,
        marginLeft: 10,
        marginTop: 5,
    },
    errorContainerAmount: {
        height: 60,
    },
    errorContainerThreshold: {
        height: 20,
    },
});
