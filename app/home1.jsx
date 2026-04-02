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
  Linking,

} from 'react-native';
import { useState } from 'react';
import Slider from '@react-native-community/slider';
import house from 'assets/realEstateGuy.png'
// ─── House images ───────────────────────────────────────────────────────────────
import houseData from 'app/gomes.json';

//---- homes ---------------------------------------------------------------------------

export default function ListingScreen() {
  const [hSearch, setHSearch] = useState('')
 const filteredHouses = houseData.filter((home) =>
  home.address.toLowerCase().includes(hSearch.toLowerCase()));

  return (
    < ScrollView style={styles.container} >
    <View style={styles.header}>
      
      < Image
        source={house}
        style={styles.heroImage}
        resizeMode="cover"
      />
     
      <TextInput type="search" style={styles.search} placeholder='Search for homes here!' id='hSearch' value={hSearch}
        onChangeText={(text)=>{
          setHSearch(text);
        
        }} />
      </View>
      <Text style={styles.thing}>Homes In Your Area </Text>

      {filteredHouses.map((data)=>{
        
        return(
        <Pressable style={styles.houses} onPress={() => Linking.openURL(data.link)}>
        < Image
          source={data.image}
          style={styles.hImage}
        />
        <Text style={styles.whiteText}>{data.address}</Text>
        <Text style={styles.whiteText}>{data.price}</Text>
        <Text style={styles.whiteText}>Beds: {data.beds}</Text>
      </Pressable>
        )
      })}

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#001B35",
    color: '#FFFFFF'
  },
  header:{
    flex:4
  },
  search:{
    position:'absolute',
    zIndex:1,
    top:100,
    left:50,
    width:300,
    color:'black',
    textAlign:'center',
    backgroundColor:'white'
  },
  heroImage: {
    width: "100%",
    height: 250,
    zIndex:0
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