import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => void;
  onGoToRegister: () => void;
  onBackToHome: () => void;
}

export default function LoginScreen({ onLogin, onGoToRegister, onBackToHome }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email.trim() && password.trim()) {
      onLogin(email, password);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Back to home button */}
      <TouchableOpacity style={styles.backButton} onPress={onBackToHome}>
        <Text style={styles.backButtonText}>← Inicio</Text>
      </TouchableOpacity>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.brandName}>Ugüee</Text>
          <Text style={styles.welcomeText}>¡Bienvenido de vuelta!</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Iniciar Sesión</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="ejemplo@correo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Tu contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>

        {/* Social Login Options */}
        <View style={styles.socialContainer}>
          <Text style={styles.orText}>O continúa con</Text>
          
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialButtonText}>📧 Continuar con Google</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialButtonText}>📘 Continuar con Facebook</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.loginButton, (!email.trim() || !password.trim()) && styles.disabledButton]} 
          onPress={handleLogin}
          disabled={!email.trim() || !password.trim()}
        >
          <Text style={styles.loginButtonText}>INICIAR SESIÓN</Text>
        </TouchableOpacity>
        
        <View style={styles.registerPrompt}>
          <Text style={styles.registerPromptText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={onGoToRegister}>
            <Text style={styles.registerLink}>Crear cuenta</Text>
          </TouchableOpacity>
        </View>
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
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  brandName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 8,
    letterSpacing: -1,
  },
  welcomeText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '500',
  },
  formContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '500',
  },
  socialContainer: {
    marginBottom: 20,
  },
  orText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 16,
  },
  socialButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  socialButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  loginButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerPromptText: {
    color: '#6B7280',
    fontSize: 16,
  },
  registerLink: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
});
