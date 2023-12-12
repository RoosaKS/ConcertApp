import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import { Button } from '@rneui/themed';
import { Icon } from '@rneui/base';
import { ref, remove } from 'firebase/database';

import database from '../firebaseConfig';

export default function Delete({ concertId, onClose  }) {

  // Funktio poiston käsittelyä varten
  const handleDelete = () => {
    if (concertId) {
      // Viittaus poistettavaan konserttiin tietokannassa
      const concertToDeleteRef = ref(database, `concerts/${concertId}`);
      // Poistetaan konsertti tietokannasta
      remove(concertToDeleteRef)
        .then(() => {
          onClose(); // Sulje Popup poiston jälkeen
        })
        .catch((error) => {
          console.error(`Virhe konsertin poistossa: ${error.message}`);
        });
    } else {
      console.error('Valittua konserttia ei voida poistaa, koska konserttia ei ole valittu tai sen avain puuttuu.');
    }
  };
  
  return (
    <View style={{ alignItems: 'center', marginRight: 10}}>
        <Button onPress={handleDelete} radius={'xl'} color={'red'}>
            <Icon name='trash'type='font-awesome' color="white"/>
        </Button>
        <Text style={{ color: 'white', fontSize: 9}}>Delete</Text>
    </View>
  );
}
