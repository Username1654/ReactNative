import {
    View,
    Text,
    Image,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
} from 'react-native';
import {
    Grocery,
    GROCERIES
} from '../src/data/groceries';
// const GROCERIES: Grocery[] = [
//     { id: 1, name: "Milk", inCart: false },
//     { id: 2, name: "powder milk", inCart: false },
//     { id: 3, name: "bagged milk", inCart: false },
//     { id: 4, name: "milk with pulp", inCart: false },
// ]
export default function GroceryScreen() {

    return (
        <View style={ styles.wrap}>
            <Text style={styles.title}>My Grocery List</Text>
            <FlatList style={styles.groc}
                data={GROCERIES}
                keyExtractor={(item:Grocery) => item.id.toString()}
                renderItem={({ item }: {item:Grocery}) => (
                    <View style={ styles.boxx}>
                        <Text style={ styles.tex}>{ '\u2022'}{item.name}</Text>
                    </View>

                ) }
            />

            <View>

            </View>
            <Text>Image here, imagine</Text>
        </View>
    )
}
const styles = StyleSheet.create({
    title: {
        fontSize: 100,
        alignSelf:'center',
        color: "black"

    },
    groc: {
        textDecorationLine: "underline",
        fontSize: 50,
        alignSelf:"center",
        color: "blue",
        backgroundColor:"#C6D2ED"

    },
    wrap: {
        backgroundColor:"#5D737E",
        flex: 1,
    },
    tex: {
        color: "#D3D5D4",
        textShadowColor: 'black',
    textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
    fontSize:80
    },
    box: {
        margin: 5,
        backgroundColor: "green",
        borderRadius:10,
    }
})