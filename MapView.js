import { useState, useEffect } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function MapScreen({route}) {
  const { latitude, longitude } = route.params
  const [region, setRegion] = useState({
    latitude: latitude,
    longitude: longitude,
    latitudeDelta: 0.15,
    longitudeDelta: 0.1
  });
  const [data, setData] = useState({
    latitude: latitude,
    longitude: longitude
  });

  const showLoc = () => {
    setRegion({...region, latitudeDelta: 0.010, longitudeDelta: 0.006})
  }

  return (
    <View style={styles.container}>
      <MapView
        style={{ width: '100%', height: '75%'}}
        region={region}
      >
        <Marker
          pinColor='yellow'
          coordinate={data}
        />
      </MapView>
      <Button onPress={showLoc} title='Show' />
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
});