import React, { Children } from "react";
import {Colors} from "./../styles/styles";


// Keyboard Avoiding View
import {KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard} from "react-native";

function KeyboardAvoidingWrapper({children}){
    return(
        <KeyboardAvoidingView style={{flex: 1, backgroundColor: Colors.white}}>
            <ScrollView>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <>{children}</>
                </TouchableWithoutFeedback>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

export default KeyboardAvoidingWrapper;