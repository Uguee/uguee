import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface WelcomeScreenProps {
  onLogin: () => void;
  onRegister: () => void;
}

export default function WelcomeScreen({ onLogin, onRegister }: WelcomeScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header dots */}
      <View style={styles.headerDots}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      {/* Logo and brand */}
      <View style={styles.brandContainer}>
        <Text style={styles.brandName}>Ugüee</Text>
        <Text style={styles.slogan}>¡Viaja seguro!</Text>
        <Text style={styles.description}>
          Respaldado por las mejores universidades
        </Text>
      </View>

      {/* Main content area */}
      <View style={styles.contentArea}>
        {/* Puedes agregar ilustraciones o contenido adicional aquí */}
      </View>

      {/* Navigation buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={onLogin}>
          <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={onRegister}>
          <Text style={styles.secondaryButtonText}>Crear una cuenta</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2025 Ugüee - Todos los derechos reservados
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  headerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 60,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  brandName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 24,
    letterSpacing: -1,
  },
  slogan: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
}); 