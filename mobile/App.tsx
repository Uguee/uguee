import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';

export default function App() {
  const handlePress = () => {
    Alert.alert('¡Hola!', 'Bienvenido a Uguee Mobile');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido a Uguee Mobile!</Text>
      
      <Text style={styles.subtitle}>
        Tu aplicación móvil está lista para desarrollar
      </Text>

      <View style={styles.buttonContainer}>
        <Button title="Presiona aquí" onPress={handlePress} />
      </View>

      <Text style={styles.instructions}>
        Toda la lógica de autenticación y backend se maneja desde la página web.
        {'\n\n'}
        Esta aplicación móvil se enfocará en la experiencia móvil nativa.
      </Text>

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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  buttonContainer: {
    marginVertical: 20,
    width: '80%',
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginTop: 30,
    lineHeight: 20,
  },
});
