import { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from'@react-navigation/native-stack';
import MapScreen from './MapView.js';
import { Input, ListItem, Button } from '@rneui/themed';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('addressdb');
const Stack = createNativeStackNavigator();

function Places({ navigation }) {
  const [place, setPlace] = useState('');
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    db.transaction(tx => {
    tx.executeSql('create table if not exists address (id integer primary key not null, address text, latitude decimal(9,6), longitude decimal(9,6));');
    }, null, updateList);
  }, []);

  const search = () => {
    fetch(`http://www.mapquestapi.com/geocoding/v1/address?key=API_KEY&location=${place}`)
    .then(response => response.json())
    .then(data => {
      const lat = data.results[0].locations[0].latLng.lat; 
      const lng = data.results[0].locations[0].latLng.lng;
      saveItem(lat, lng);
    })
    .catch(error => Alert.alert('Error', 'Invalid input' + error))
  }

  const saveItem = (lat, lng) => {
    db.transaction(tx => {
      tx.executeSql('insert into address (address, latitude, longitude) values (?, ?, ?);',
      [place, lat, lng]);
    }, null, updateList);
    setPlace('');
  }

  const updateList = () => {
    db.transaction(tx => {
      tx.executeSql('select * from address;', [], (_, { rows }) =>
        setAddresses(rows._array)
      );
    }, null, null);
  }

  const deleteItem = (id) => {
    db.transaction(tx => {
      tx.executeSql('delete from address where id = ?;', [id]);
    }, null, updateList)
  }

  return (
    <View style={styles.container}>
      <Input
      label='Placefinder'
      placeholder='Type in address'
      onChangeText={text => setPlace(text)}
      value={place}/>
      <Button raised icon={{name: 'save'}} onPress={search} title="Save" />

      <FlatList
        renderItem={({item, index}) =>
          <ListItem
            onPress={() => navigation.navigate('MapScreen', { latitude: item.latitude, longitude: item.longitude})}
            onLongPress={() =>
              Alert.alert('Are you sure?', 'Delete ' + item.address + '?', [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Deletion cancelled'),
                  style: 'cancel',
                },
                {text: 'OK', onPress: () => deleteItem(item.id)},
              ])
            }
          >
            <ListItem.Content>
              <ListItem.Title>{item.address}</ListItem.Title>
              <ListItem.Subtitle right={true}>tap to show on map, hold to delete</ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron/>
          </ListItem>
        }
        data={addresses}
      ></FlatList>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Places" component={Places} />
        <Stack.Screen name="MapScreen" component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});