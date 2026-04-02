import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
export default function testScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.texts}>Hi there</Text>
        </View>,
         <View style={styles.container}>
         <Text style={styles.texts}>E</Text>
     </View>,
         <View style={styles.container}>
         <Text style={styles.texts}>Hi there</Text>
     </View>
          )
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: "blue",
        height: "40%",
        borderRadius: "10%",
        marginTop:"10%"
    },
    texts: {
        textAlign: 'center',
        color:"white",
        fontSize: 100,
    }
})