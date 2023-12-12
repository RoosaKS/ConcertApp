import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { ref, onValue } from 'firebase/database';

import database from '../firebaseConfig';


export default function Map() {
  const [mapRegion, setMapRegion] = useState({
    latitude: 65.201692,
    longitude: 24.934302,
    latitudeDelta: 12,
    longitudeDelta: 11,
  });
  const [concertLocations, setConcertLocations] = useState([]);

  //hakee konserttipaikkoja Firebase-tietokannasta
  useEffect(() => {
    const concertsRef = ref(database, 'concerts/');

    onValue(concertsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const modifiedConcerts = Object.values(data).map((concert) => {
          const { latitude, longitude } = concert.location.coordinates;
          return {
            latitude,
            longitude,
            ...concert, // Säilytetään muut konsertin tiedot
          };
        });
        setConcertLocations(modifiedConcerts);
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <MapView 
      style={styles.map}
      region={mapRegion}
      >
      {concertLocations.map((concert, index) => {
    if (
      concert &&
      typeof concert.latitude === 'number' &&
      !isNaN(concert.latitude) &&
      typeof concert.longitude === 'number' &&
      !isNaN(concert.longitude)
    ) {
      return (
        <Marker
          key={index}
          coordinate={{
            latitude: concert.latitude,
            longitude: concert.longitude,
          }}
        >
        <Callout>
          <Text>{concert.artistName}</Text>
        </Callout>
        </Marker>
      );
    } else {
      console.warn(`Invalid coordinates for concert at index ${index}`);
      return null; // Palautetaan tyhjä arvo, jos koordinaatit ovat virheelliset
    }
  })}
      </MapView>
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
  map:{
    width: '100%',
    height: '100%'
  }
});