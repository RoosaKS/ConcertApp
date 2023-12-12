import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { Input, Button } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { ref as storageRef, getDownloadURL, uploadBytes } from 'firebase/storage';
import { update, ref, onValue } from 'firebase/database';
import database from '../firebaseConfig';
import firebaseStorage from '../storageFirebaseConfig';
import { decode } from 'base-64';

// Tarkistetaan, onko atob jo määritelty. Jos ei, liitetään base-64 -kirjaston decode-funktio atob-nimiseen globaaliin muuttujaan.
if(typeof atob === 'undefined') {
  global.atob = decode;
}

export default function EditConcerts({ route }) {
  // Destructuring route.params:n sisältämät tiedot, kuten concertId, artistName, date, location ja imageUrl.
  const { concertId } = route.params;
  const [artistName, setArtistName] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [chosenDate, setChosenDate] = useState(new Date());
  const [displayDate, setDisplayDate] = useState('');
  const [concertLocation, setConcertLocation] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [image, setImage] = useState(null);

  const navigation = useNavigation();


  const [mapRegion, setMapRegion] = useState({
    latitude: 65.201692,
    longitude: 24.934302,
    latitudeDelta: 12,
    longitudeDelta: 11,
  });

    // Funktio kuvan lataamiseen Firebase Storageen.

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

      const selectedImageUri = result.assets[0].uri; 
      setImage(selectedImageUri);
      await uploadImageToFirebase(selectedImageUri);
    }
  };
  
  // useEffect käytetään tietokantatiedon päivittämiseen
  useEffect(() => {

    const concertRef = ref(database, `concerts/${concertId}`);
    
    onValue(concertRef, (snapshot) => {
      const concertData = snapshot.val();
      if (concertData) {
        setArtistName(concertData.artistName || '');
        setDisplayDate(concertData.date || '');
        setConcertLocation(concertData.location.name || '');
        setImage(concertData.imageUrl || null);
       
      }
    });
  }, [concertId]);

    // Käsittelijä päivämäärän valinnalle.
  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setChosenDate(selectedDate);
      setDisplayDate(selectedDate.toDateString());
    }
  };

    // Funktio konserttitietojen tallentamiseen Firebaseen.
  const saveChanges = async () => {
    try {
      // Päivitä tietokanta Firebaseen muokatuilla tiedoilla
      const imageUrl = await uploadImageToFirebase(image);
      // Fetch-pyynnöllä haetaan dataa ulkoisesta API:sta
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

      // Päivitetään konserttitiedot tietokantaan.
      const concertRef = ref(database, `concerts/${concertId}`);
      await update(concertRef, {
        artistName: artistName,
        date: displayDate,
        location: { 
          name: concertLocation,
          city: city,
          coordinates: { latitude: lat, longitude: lng } 
        },
        imageUrl: imageUrl
      });
      // Siirrytään takaisin edelliseen näkymään.
      navigation.goBack();
    } else {
          console.warn('Koordinaatit puuttuvat hakutuloksista.');
        }
      } else {
        console.warn('Ei hakutuloksia.');
      }
    } catch (error) {
      console.error('Error updating concert:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        placeholder='Name of the artist'
        onChangeText={(text) => setArtistName(text)}
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
          onChangeText={(text) => setConcertLocation(text)}
          value={concertLocation}
        />

        <View style={{marginBottom: 5}}>
        <Button title="Pick an image from camera roll" onPress={pickImage}/>
        </View>
        {image && <Image source={{ uri: image }} style={{ width: 150, height: 150, marginTop: 10, marginBottom: 10 }} />}

        <Button onPress={saveChanges} title="Save Changes" style={styles.buttons}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

});