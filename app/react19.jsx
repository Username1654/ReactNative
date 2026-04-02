import { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";

export default function app() {
    return (
        <View style={{ flex:1}}>
            <View style={{ backgroundColor: "blue", flex: 1 }}></View>
            <View style={{ backgroundColor: "yellow", flex: 1 }}></View>
            <View style={{ backgroundColor: "green", flex: 1 }}></View>
            <View style={{ backgroundColor: "pink", flex: 1 }}></View>
            <View style={{ backgroundColor: "black", flex: 1 }}></View>
            <View style={{ backgroundColor: "red", flex: 1 }}></View>
        </View>
    )
}