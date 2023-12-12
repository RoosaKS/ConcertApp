import { View, Image, FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from 'react';
import Popup from './Popup.js';
import { ref, onValue } from 'firebase/database';

import database from '../firebaseConfig';

export default function Photos() {
    const [concertPhotos, setConcertPhotos] = useState([]);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    // Haetaan konserttikuvat Firebase-tietokannasta
    useEffect(() => {
        const concertsRef = ref(database, 'concerts/');
    
        onValue(concertsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const modifiedConcerts = Object.values(data).reduce((filteredConcerts, concert) => {
                    if (concert.imageUrl) {
                        filteredConcerts.push({
                            imageUrl: concert.imageUrl,
                            ...concert,
                        });
                    }
                    return filteredConcerts;
                }, []);
                setConcertPhotos(modifiedConcerts);
            }
        });
    }, []);

      // Avaa popup-ikkunan valitulle konsertille
      const openPopup = (concert) => {
        setSelectedPhoto(concert);
      };
      // Sulkee popup-ikkunan
      const closePopup = () => {
        setSelectedPhoto(null);
      };

    return(
        <View style={styles.container}>
            <FlatList
            data={concertPhotos} 
            numColumns={2} 
            contentContainerStyle={styles.contentContainer}
            keyExtractor={(_, index) => index.toString()} 
            renderItem={({item}) => (
                <View style={styles.itemContainer}>
                    <TouchableOpacity onPress={() => openPopup(item)}>
                    <Image source={{ uri: item.imageUrl }} style={styles.image} />
                    <Text style={styles.text} numberOfLines={2} ellipsizeMode="tail">
                        {item.artistName}
                    </Text>
                    </TouchableOpacity>
                </View>
            )} 

            />
          {selectedPhoto && (
            <Popup visible={true} concert={selectedPhoto} onClose={closePopup} />
          )} 
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemContainer: {
        width: '47%',
        margin: 5,
        alignItems: 'center',
    },
    contentContainer: {
        justifyContent: 'space-between',
    },
    image: {
        width: 160, 
        height: 160,
        margin: 6
  },
  text: {
    textAlign: 'center',
    fontWeight: 'bold'
  }

});
