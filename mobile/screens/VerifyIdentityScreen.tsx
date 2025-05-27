import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface VerifyIdentityScreenProps {
  onContinue: () => void;
  onSkip: () => void;
  onBackToHome?: () => void;
}

export default function VerifyIdentityScreen({ onContinue, onSkip, onBackToHome }: VerifyIdentityScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Back to home button */}
      {onBackToHome && (
        <TouchableOpacity style={styles.backButton} onPress={onBackToHome}>
          <Text style={styles.backButtonText}>← Inicio</Text>
        </TouchableOpacity>
      )}
      
      {/* Header dots */}
      <View style={styles.headerDots}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      {/* Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>🆔</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Verificar Identidad</Text>

      {/* Description */}
      <Text style={styles.description}>
        Para garantizar la seguridad de todos nuestros usuarios, necesitamos verificar tu identidad.
        {'\n\n'}
        Este proceso es rápido y seguro. Solo tomará unos minutos completarlo.
      </Text>

      {/* Features */}
      <View style={styles.featuresContainer}>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>🔒</Text>
          <Text style={styles.featureText}>Proceso 100% seguro</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>⚡</Text>
          <Text style={styles.featureText}>Verificación instantánea</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>🛡️</Text>
          <Text style={styles.featureText}>Datos protegidos</Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={onContinue}>
          <Text style={styles.primaryButtonText}>VERIFICAR AHORA</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={onSkip}>
          <Text style={styles.secondaryButtonText}>Verificar más tarde</Text>
        </TouchableOpacity>
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '500',
  },
  headerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    marginTop: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#8B5CF6',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 40,
  },
  featuresContainer: {
    marginBottom: 60,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
  },
  buttonContainer: {
    marginTop: 'auto',
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
    paddingVertical: 16,
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'center',
  },
}); 