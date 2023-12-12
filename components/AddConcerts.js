import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';
import { Input, Button } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { ref as storageRef, getDownloadURL, uploadBytes } from 'firebase/storage';
import { push, ref, onValue } from 'firebase/database';
import database from '../firebaseConfig';
import firebaseStorage from '../storageFirebaseConfig';
import { decode } from 'base-64';

// Tarkistetaan, onko atob jo määritelty. Jos ei, liitetään base-64 -kirjaston decode-funktio atob-nimiseen globaaliin muuttujaan.
if(typeof atob === 'undefined') {
  global.atob = decode;
}

export default function AddConcerts() {
  const [artistName, setArtistName] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [chosenDate, setChosenDate] = useState(new Date());
  const [displayDate, setDisplayDate] = useState('');
  const [concertLocation, setConcertLocation] = useState('');
  const [concerts, setConcerts] = useState([]);
  const [repositories, setRepositories] = useState([]);
  const [image, setImage] = useState(null);

  const navigation = useNavigation();

  // Alustetaan kartan sijaintitila
  const [mapRegion, setMapRegion] = useState({
    latitude: 65.201692,
    longitude: 24.934302,
    latitudeDelta: 12,
    longitudeDelta: 11,
  });

// Funktio kuvan lataamiseksi Firebaseen
  const uploadImageToFirebase = async (imageUri) => {
    try {
      let downloadURL = null;

      if (imageUri) {
        const filename = `images/${artistName}_${new Date().getTime()}.jpg`;
      
        const response = await fetch(imageUri);
        const blob = await response.blob();
      
        const imageStorageRef = storageRef(firebaseStorage, filename);

        const metadata = {
          contentType: 'image/jpeg' 
        };
        
        await uploadBytes(imageStorageRef, blob, metadata); 
      
        downloadURL = await getDownloadURL(imageStorageRef);
      }
    return downloadURL;
  } catch (error) {
    throw new Error('Error uploading image to Firebase Storage: ' + error.message);
  }
};   

  // Funktio kuvan valitsemiseksi galleriasta
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });
  
  
    if (!result.canceled && result.assets.length > 0) {
      // Käsittele valitut resurssit täällä
      const selectedImageUri = result.assets[0].uri; // Esimerkkinä ensimmäinen valittu resurssi
      setImage(selectedImageUri);
      await uploadImageToFirebase(selectedImageUri);
    }
  };
  
    // Funktio hakutulosten hakemiseksi ja tallentamiseksi Firebaseen
  const fetchRepositories = async () => {
    try {
      const imageUrl = await uploadImageToFirebase(image);
      const response = await fetch(process.env.EXPO_PUBLIC_API_URL + process.env.EXPO_PUBLIC_API_KEY + "&location=" + concertLocation);
      const data = await response.json();
  
      setRepositories(data.results);
  
      if (data.results.length > 0) {
        const firstResult = data.results[0];
        const { locations } = firstResult;
  
        if (locations && locations.length > 0) {
          const lat = locations[0].latLng.lat;
          const lng = locations[0].latLng.lng;
          const city = locations[0].adminArea5;
  
          setMapRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.0322,
            longitudeDelta: 0.0221,
          });
  
          push(ref(database, 'concerts/'), { 
            'artistName': artistName, 
            'date': displayDate, 
            'location': {
              name: concertLocation,
              city: city,
              coordinates: { latitude: lat, longitude: lng }
            },
            'imageUrl': imageUrl
          });
  
          setArtistName('');
          setConcertLocation('');
          setDisplayDate('');
          setImage(null);
          navigation.navigate('Concerts');
        } else {
          console.warn('Coordinates are missing from the search results.');
        }
      } else {
        console.warn('No search results.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  
  // Käsittelijä päivämäärän valinnalle
  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setChosenDate(selectedDate);
      setDisplayDate(selectedDate.toDateString()); // Muuntaa valitun päivämäärän merkkijonoksi
    }
  };


  //hakee konserttidataa tietokannasta
  useEffect(() => {
    const concertsRef = ref(database, 'concerts/');
    onValue(concertsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert the data into an array of items with their IDs
        const concertsWithIds = Object.entries(data).map(([concertId, concertData]) => ({
          concertId,
          ...concertData
        }));

        // Set the items state with the array of items
        setConcerts(concertsWithIds);
      }
    });
  }, []);

  return (
    <View style={styles.container}>
        <Input
        placeholder='Name of the artist' 
        onChangeText={artistName => setArtistName(artistName)}
        value={artistName}
        />

        <Button title="Open Datepicker" onPress={() => setShowPicker(true)} />
        {showPicker && (
        <DateTimePicker
          value={chosenDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
        <Text>Chosen Date: {displayDate}</Text>

        <Input
          placeholder='Location' 
          onChangeText={concertLocation => setConcertLocation(concertLocation)}
          value={concertLocation}
        />
              <View style={styles.buttonContainer}>

        <View style={{marginBottom: 5}}>
          <Button title="Pick an image from camera roll" onPress={pickImage}/>
        </View>
        {image && <Image source={{ uri: image }} style={{ width: 150, height: 150, marginTop: 10, marginBottom: 10 }} />}

        <Button onPress={fetchRepositories} title="Save" style={styles.buttons}/>
</View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20, 
  },
  buttons: {
    marginBottom: 10,
  }
});
