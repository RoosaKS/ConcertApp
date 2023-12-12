import { View, Image, StyleSheet, Text, Modal, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import React, { useState, useEffect } from 'react';
import { Icon } from '@rneui/base';
import Delete from "./DeleteConcerts";
import {  Button } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { ref, onValue } from 'firebase/database';

import database from '../firebaseConfig';

export default function Popup({visible, onClose, concert}) {
    const [concerts, setConcerts] = useState([]);
    const navigation = useNavigation();

    // Haetaan konserttitiedot tietokannasta ja päivitetään concerts-tila
    useEffect(() => {
       
        const concertRef = ref(database, `concerts/`);
    
        onValue(concertRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setConcerts(data);
          }
        });
      }, [concert]);

    return(
        <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        
        >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

        <View style={styles.container}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Icon name='close'type='material-icons' color="white"/>
            </TouchableOpacity>

            <View style={styles.buttons}>
                <View style={{ alignItems: 'center', marginRight: 10}}>
                  <Button onPress={() => { 
                    onClose();
                    navigation.navigate('Edit', { concertId: concert.id })
                    }} radius={'xl'} color={'#007bff'}>
                      <Icon name='edit'type='font-awesome' color="white"/>
                  </Button>
                  <Text style={{ color: 'white', fontSize: 9}}>Edit</Text>
              </View>

                <View style={{ alignItems: 'center', marginRight: 10}}>
                <Delete concertId={concert.id} onClose={onClose}/>
                </View>
            </View>
            
            
        {concerts && (
          <View style={styles.concertInfo}>
            {/*jos imageUrl on null tulee kuvan tilalle placeholder kuva*/}
            <Image style={styles.image} 
              source={
              concert.imageUrl
              ? { uri: concert.imageUrl }
              : require ('../ConcertPlaceholder.png')}/>
            
            <View>
                <Text style={styles.text}>Artist: {concert.artistName}</Text>
                <Text style={styles.text}>Date: {concert.date}</Text>
                <Text style={styles.locationText}>Location: {concert.location.name}, {concert.location.city}</Text>
            </View>
          </View>
        )}
      </View>
      </View>

    </Modal>
  );
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: 'rgba(40, 40, 40, 0.99)',
      padding: 20,
      height: Dimensions.get('window').height, 
      width: Dimensions.get('window').width,
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
        width: 290, 
        height: 290,
        margin: 6,
        top: 10,
    },
    buttons: {
        flexDirection: 'row',
        marginBottom: 40,
        top: 355,
        position: 'absolute',
  
      },
    text: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'white',
        fontSize: 20,
        top:95,
        marginBottom: 10
    },
    locationText: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'white',
        fontSize: 20,
        top:95,
        marginBottom:160
    },
    concertInfo: {
        alignItems: 'center',
        bottom: 40
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'transparent',
        zIndex: 1,
    },
  
});
