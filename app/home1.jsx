import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Button,
  Pressable,
  Linking
} from 'react-native';
import Slider from '@react-native-community/slider';
import house from 'assets/house.png'
// ─── House Data ───────────────────────────────────────────────────────────────
import houseData from 'app/gomes.json';
import house1 from "assets/house1.jpg";
import house2 from "assets/house2.png";
// ─── Image Sources ────────────────────────────────────────────────────────────
// TODO: swap between these two and observe the difference


export default function ListingScreen() {
  return (
    < ScrollView style={styles.container} >
      < Image
        source={house}
        style={styles.heroImage}
        resizeMode="cover"
      />
      <Text style={styles.thing}>Homes In Your Area </Text>

      <Pressable style={styles.houses} onPress={() => Linking.openURL('https://www.zillow.com/homedetails/42825-N-17th-Pl-New-River-AZ-85087/301612359_zpid/')}>
        < Image
          source={house1}
          style={styles.hImage}
        />
        <Text style={styles.whiteText}>{houseData.house1.address}</Text>
        <Text style={styles.whiteText}>{houseData.house1.price}</Text>
        <Text style={styles.whiteText}>Beds: {houseData.house1.beds}</Text>
      </Pressable>

      <Pressable style={styles.houses} onPress={() => Linking.openURL('https://www.zillow.com/homedetails/38417-N-16th-St-Phoenix-AZ-85086/50183624_zpid/')}>
        < Image
          source={house2}
          style={styles.hImage}
        />
        <Text style={styles.whiteText}>{houseData.house2.address}</Text>
        <Text style={styles.whiteText}>{houseData.house2.price}</Text>
        <Text style={styles.whiteText}>Beds: {houseData.house2.beds}</Text>
      </Pressable>




    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#001B35",
    color: '#FFFFFF'
  },
  heroImage: {
    width: "100%",
    height: 250,
  },
  thing: {
    fontSize: 20,
    fontStyle: "bold",
    textAlign: "center",
    color: '#FFFFFF',
    marginBottom: '10px'
  },
  houses: {
    color: '#FFFFFF',
    backgroundColor: "#003568",
    borderRadius: "10%",
    width: "90%",
    alignSelf: "center",
    marginBottom: "50px"

  },
  whiteText: {
    color: '#FFFFFF',
    textAlign: "center"
  },
  hImage: {
    width: "100%",
    height: 150,
    borderRadius: "10%",

  }
})