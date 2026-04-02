import { StyleSheet, View, Box } from "react-native";
export default function apps() {
    return (
        <View style={ styles.container}>
            <View style={{ backgroundColor: "#8e9b00" }}>Box 1</View>
            <View style={{ backgroundColor: "#b65d1f" }}>Box 2</View>
            <View style={{ backgroundColor: "#1c4c56" }}>Box 3</View>
            <View style={{ backgroundColor: "#ab9156" }}>Box 4</View>
            <View style={{ backgroundColor: "#6b0803" }}>Box 5</View>
            <View style={{ backgroundColor: "#1c4c56" }}>Box 6</View>
            <View style={{ backgroundColor: "#b95f21" }}>Box 7</View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection:"row",
        margin: 64,
        borderWidth: 6,
        borderColor:"red"
    }
})