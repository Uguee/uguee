import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface StartVerificationScreenProps {
  onStartVerification: () => void;
  onGoBack: () => void;
  onBackToHome?: () => void;
}

export default function StartVerificationScreen({ onStartVerification, onGoBack, onBackToHome }: StartVerificationScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Back to home button */}
      {onBackToHome && (
        <TouchableOpacity style={styles.backButton} onPress={onBackToHome}>
          <Text style={styles.backButtonText}>← Inicio</Text>
        </TouchableOpacity>
      )}
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header dots */}
        <View style={styles.headerDots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🚀</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Iniciar Verificación</Text>

        {/* Description */}
        <Text style={styles.description}>
          Todo está listo para comenzar tu proceso de verificación de identidad.
          {'\n\n'}
          El proceso constará de los siguientes pasos:
        </Text>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Captura tu documento</Text>
              <Text style={styles.stepDescription}>
                Toma fotos del frente y reverso de tu documento
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Selfie de verificación</Text>
              <Text style={styles.stepDescription}>
                Toma una selfie para verificar que eres tú
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Verificación en vivo</Text>
              <Text style={styles.stepDescription}>
                Realiza movimientos para confirmar tu presencia
              </Text>
            </View>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Consejos para una verificación exitosa:</Text>
          <Text style={styles.tip}>• Asegúrate de tener buena iluminación</Text>
          <Text style={styles.tip}>• Mantén tu documento plano y visible</Text>
          <Text style={styles.tip}>• Mira directamente a la cámara</Text>
          <Text style={styles.tip}>• Busca un lugar sin ruido de fondo</Text>
        </View>

        {/* Time estimate */}
        <View style={styles.timeEstimate}>
          <Text style={styles.timeIcon}>⏱️</Text>
          <Text style={styles.timeText}>Tiempo estimado: 3-5 minutos</Text>
        </View>
      </ScrollView>

      {/* Buttons - Fixed at bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={onStartVerification}>
          <Text style={styles.primaryButtonText}>INICIAR VERIFICACIÓN</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={onGoBack}>
          <Text style={styles.secondaryButtonText}>Volver atrás</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
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
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 24,
  },
  stepsContainer: {
    marginBottom: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  tipsContainer: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 6,
  },
  tip: {
    fontSize: 12,
    color: '#92400E',
    marginBottom: 2,
    lineHeight: 16,
  },
  timeEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  timeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  timeText: {
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 15,
    textAlign: 'center',
  },
}); 