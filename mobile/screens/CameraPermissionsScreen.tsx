import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface CameraPermissionsScreenProps {
  onAllow: () => void;
  onDeny: () => void;
  onBackToHome?: () => void;
}

export default function CameraPermissionsScreen({ onAllow, onDeny, onBackToHome }: CameraPermissionsScreenProps) {
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
          <View style={styles.dot} />
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>📹</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Permisos</Text>

        {/* Description */}
        <Text style={styles.description}>
          Esta aplicación requiere acceso a tu ubicación, cámara y a los datos de tu cuenta de Play Store.
          {'\n\n'}
          Haz clic en el botón si aceptas los permisos necesarios que requiere esta aplicación.
        </Text>

        {/* Permission items */}
        <View style={styles.permissionsContainer}>
          <View style={styles.permissionItem}>
            <View style={styles.permissionIcon}>
              <Text style={styles.permissionIconText}>📷</Text>
            </View>
            <View style={styles.permissionContent}>
              <Text style={styles.permissionTitle}>Cámara</Text>
              <Text style={styles.permissionDescription}>
                Para tomar fotos de tu documento de identidad
              </Text>
            </View>
          </View>

          <View style={styles.permissionItem}>
            <View style={styles.permissionIcon}>
              <Text style={styles.permissionIconText}>🎥</Text>
            </View>
            <View style={styles.permissionContent}>
              <Text style={styles.permissionTitle}>Video</Text>
              <Text style={styles.permissionDescription}>
                Para grabar video durante la verificación
              </Text>
            </View>
          </View>

          <View style={styles.permissionItem}>
            <View style={styles.permissionIcon}>
              <Text style={styles.permissionIconText}>📍</Text>
            </View>
            <View style={styles.permissionContent}>
              <Text style={styles.permissionTitle}>Ubicación</Text>
              <Text style={styles.permissionDescription}>
                Para verificar tu ubicación
              </Text>
            </View>
          </View>
        </View>

        {/* Security notice */}
        <View style={styles.securityNotice}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>
            Todos los datos se procesan de forma segura
          </Text>
        </View>
      </ScrollView>

      {/* Buttons - Fixed at bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={onAllow}>
          <Text style={styles.primaryButtonText}>ESTOY DE ACUERDO</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={onDeny}>
          <Text style={styles.secondaryButtonText}>No permitir</Text>
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
  permissionsContainer: {
    marginBottom: 20,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  permissionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  permissionIconText: {
    fontSize: 16,
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  permissionDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  securityIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  securityText: {
    fontSize: 13,
    color: '#166534',
    flex: 1,
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