import { View, Text, StyleSheet, ScrollView, Image, TextInput } from 'react-native';
import Slider from '@react-native-community/slider'
export default function houseOneScreen() {
    const remote_image = { uri: 'https://images.pexels.com/photos/2135/food-france-morning-breakfast.jpg' }
    const local_image = require('../assets/house-comp1.png')
    return (
        <ScrollView>
            <Image source={local_image} style={{ width: "100%", height: 500 } } resizeMode="stretch"/>
            <Text style={styles.title} selectable={true}>My house!</Text>
            <Text style={styles.title} selectable={true}>Your house!</Text>
            <Slider
  minimumValue={100000}
  maximumValue={900000}
  step={5000}
  value={400000}
  onValueChange={(value) => console.log(value)}
  minimumTrackTintColor="#4f46e5"
  maximumTrackTintColor="#334155"
                thumbTintColor="#4f46e5"
            />
            <TextInput placeholder="Your email here"/>
        </ScrollView>
    )
}
const typography = {
    sm: 12,
    md: 18,
    lg: 24,
    xl:32
}
let styles = StyleSheet.create({
    title: {
        color: "black",
        fontSize: typography.xl,
        textAlign: "center",
        fontWeight: "bold",
        letterSpacing: 20,
        lineHeight:90
    }
})