import { ListItem } from "@rneui/base";
import { StyleSheet, View, FlatList, Text, ScrollView, TouchableOpacity } from "react-native";
import {Picker} from '@react-native-picker/picker';
import React, { useState, useEffect } from 'react';
import Popup from './Popup.js';
import { ref, onValue } from 'firebase/database';

import database from '../firebaseConfig';


export default function Concerts() {
    const [selectedCategory, setSelectedCategory] = useState('Past');
    const [pastConcerts, setPastConcerts] = useState([]);
    const [upcomingConcerts, setUpcomingConcerts] = useState([]);
    const [selectedConcert, setSelectedConcert] = useState(null);

    // hakee konserttidataa Firebase-tietokannasta
    useEffect(() => {
        const concertsRef = ref(database, 'concerts/');
    
        onValue(concertsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
              const modifiedConcerts = Object.keys(data).map((key) => {
                const concert = data[key];
                return {
                  id: key, // Käytä Firebaseen tallennettua key-arvoa
                  ...concert
                };
              });

              const currentDate = new Date();

              // Käsitellään data ja jaetaan menneet ja tulevat konsertit
              // Lajitellaan konsertit päivämäärän perusteella

              const past = modifiedConcerts.filter(concert =>
                new Date(concert.date) < currentDate
              ).sort((a, b) => new Date(a.date) - new Date(b.date));

              const upcoming = modifiedConcerts.filter(concert =>
                new Date(concert.date) >= currentDate
              ).sort((a, b) => new Date(a.date) - new Date(b.date));

              setPastConcerts(past);
              setUpcomingConcerts(upcoming);
            }
          });
    }, []);
    
    const listSeparator = () => {
        return (
          <View
            style={{
              height: 5,
              width: "100%",
              backgroundColor: "#fff",
            }}
          />
        );
      };

      // Avaa popup-ikkunan valitulle konsertille
    const openPopup = (concert) => {
      setSelectedConcert(concert);
    };
      // Sulkee popup-ikkunan
    const closePopup = () => {
      setSelectedConcert(null);
    };

    // Käsittelee kategorian muutoksen (menneet ja tulevat)
    const handleCategoryChange = (category) => {
      setSelectedCategory(category);
    };

    // Renderöi konsertit valitun kategorian perusteella
    const renderConcerts = () => {
      if (selectedCategory === 'Past') {
        return(
          <View>
          <FlatList
            style={styles.list}
            keyExtractor={(item) => item.id}  
            renderItem={({item}) => 
                <TouchableOpacity onPress={() => openPopup(item)}>
                  <ListItem.Content>
                    <ListItem.Title style={{fontWeight: 'bold'}}>{item.artistName}</ListItem.Title>
                    <ListItem.Subtitle>{item.date}</ListItem.Subtitle>
                    <ListItem.Subtitle>{item.location.name}, {item.location.city}</ListItem.Subtitle>
                  </ListItem.Content>
                </TouchableOpacity>
              } 
            data={pastConcerts} 
            ItemSeparatorComponent={listSeparator} 
          /> 
          {selectedConcert && (
            <Popup visible={true} concert={selectedConcert} onClose={closePopup} />
          )} 
          </View>
        );
      }else if (selectedCategory === 'Upcoming') {
        return (
          <View>
          <FlatList
            style={styles.list}
            keyExtractor={(item) => item.id} 
            renderItem={({item}) => 
                <TouchableOpacity onPress={() => openPopup(item)}>
                  <ListItem.Content>
                    <ListItem.Title style={{fontWeight: 'bold'}}>{item.artistName}</ListItem.Title>
                    <ListItem.Subtitle>{item.date}</ListItem.Subtitle>
                    <ListItem.Subtitle>{item.location.name}, {item.location.city}</ListItem.Subtitle>

                  </ListItem.Content>
                </TouchableOpacity>
              } 
            data={upcomingConcerts} 
            ItemSeparatorComponent={listSeparator} 
          />

          {selectedConcert && (
            <Popup visible={true} concert={selectedConcert} onClose={closePopup} />
            
          )} 
          </View>
        );
      }
      return null;
  };

    return(
        <View  style={{ flex: 1 }}>
          <Picker
            selectedValue={selectedCategory}
            style= {{backgroundColor: 'pink'}}
            onValueChange={(itemValue) => handleCategoryChange(itemValue)}
          >
          <Picker.Item label="Past Concerts" value="Past" />
          <Picker.Item label="Upcoming Concerts" value="Upcoming" />
        </Picker>
        <View  style={{ flex: 1 }}>
          {renderConcerts()}
        </View>

        </View>
    );
}

const styles = StyleSheet.create({
    list: { 
        marginLeft: '3%'
    },
    sectionHeader: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 10,
      marginLeft: '3%',
  },

});
