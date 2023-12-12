import { StyleSheet, Text, View, Dimensions, ScrollView } from 'react-native';
import {Calendar} from 'react-native-calendars';
import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import moment from 'moment/moment';

import database from '../firebaseConfig';


export default function Calendars() {
    const [selected, setSelected] = useState('');
    const [concertDates, setConcertDates] = useState([]);


    //hakee konserttipäivämäärät Firebase-tietokannast
    useEffect(() => {
    const concertsRef = ref(database, 'concerts/');

    onValue(concertsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const modifiedConcerts = Object.values(data).map((concert) => {
            const date = concert.date;
            return {
              date,
              ...concert, 
            };
          });
          setConcertDates(modifiedConcerts);
        }
      });
    }, []);

    // Renderöi tapahtumat valitulle päivälle
    const renderEventDetails = () => {
        if (!selected) {
          return null; // Jos päivää ei ole valittu, älä näytä mitään
        }
      
        const eventsForSelectedDay = concertDates.filter((concert) => {
          return moment(concert.date).isSame(selected, 'day'); // Vertaa päivämääriä
        });
      
        if (eventsForSelectedDay.length > 0) {
          // Jos valitulle päivälle on tapahtumia, näytä tiedot
          return (
            <View style={styles.concertDetails}>
              <Text style={styles.dateText}>{moment(selected).format('DD.MM.YYYY')}</Text>
              <View
                style={{
                  height: 1,
                  backgroundColor: "#000",
                }}
              />
              {eventsForSelectedDay.map((event, index) => (
                <View key={index}>
                  <Text style={{fontWeight: 'bold', marginTop:5}}>{event.artistName}</Text>
                  <Text style={{marginBottom: 7}}>{event.location?.name}, {event.location?.city}</Text>
                  <View
                    style={{
                      height: 0.4,
                      backgroundColor: "gray",
                    }}
                  />
                </View>
              ))}
            </View>
          );
        } else {
          return (
            <View style={styles.eventDetails}>
              <Text>No events on the selected day</Text>
            </View>
          );
        }
      };
      
      

    return(
        <View style={styles.container}>
        <Calendar
        style={styles.calendar}
        onDayPress={day => {
            setSelected(day.dateString);
        }}
        markedDates={{
          [selected]: {
            selected: true,
            disableTouchEvent: true,
            selectedColor: 'lightblue', 
          },
          ...concertDates.reduce((marked, concert) => {
            const formattedDate = moment(concert.date, 'ddd MMM DD YYYY').format(
              'YYYY-MM-DD'
            );
            marked[formattedDate] = {
              marked: true,
              dotColor: 'orange',
              selected: selected === formattedDate,
              selectedColor: 'lightblue', // Vaihda tämä valitun päivän taustaväriksi

            };
            return marked;
          }, {}),
        }}
      />   
        <ScrollView style={styles.scrollContainer}>
          {renderEventDetails()}
        </ScrollView>
        
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
    calendar: {
    width: Dimensions.get('window').width, 
    height: Dimensions.get('window').height * 0.5, 
    },
    dateText:{
      fontWeight: 'bold',
      marginBottom: 5,
    },
    scrollContainer: {
      flex: 1,
      width: '85%',
      marginBottom: 10
  },
  eventDetails: {
    alignItems: 'center'
  }
    
  });