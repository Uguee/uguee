import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';

interface RegisterScreenProps {
  onRegister: (data: RegisterData) => void;
  onGoToLogin: () => void;
  onBackToHome: () => void;
}
interface RegisterData {
  name: string;
  lastName: string;
  cedula: string;
  birthDate: string;
  phone: string;
  email: string;
  password: string;
}

export default function RegisterScreen({ onRegister, onGoToLogin, onBackToHome }: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cedula, setCedula] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [birthDateString, setBirthDateString] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || birthDate;
    setShowDatePicker(Platform.OS === 'ios');
    setBirthDate(currentDate);
    
    // Formatear la fecha como YYYY-MM-DD para PostgreSQL
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear();
    setBirthDateString(`${year}-${month}-${day}`);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleRegister = () => {
    if (name.trim() && lastName.trim() && cedula.trim() && birthDateString.trim() && phone.trim() && email.trim() && password.trim()) {
      onRegister({
        name,
        lastName,
        cedula,
        birthDate: birthDateString,
        phone,
        email,
        password
      });
    }
  };

  const isFormValid = name.trim() && lastName.trim() && cedula.trim() && birthDateString.trim() && phone.trim() && email.trim() && password.trim();

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
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.brandName}>Ugüee</Text>
          <Text style={styles.title}>Registro</Text>
          <Text style={styles.subtitle}>
            Conectate para viajar{'\n'}seguro y economico
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu nombre"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Last name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Apellido</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu apellido"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>

          {/* Cedula */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cédula</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu cédula"
              value={cedula}
              onChangeText={setCedula}
              keyboardType="numeric"
            />
          </View>

          {/* Date of birth */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Fecha de nacimiento</Text>
            <TouchableOpacity onPress={showDatepicker} style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Selecciona tu fecha de nacimiento (YYYY-MM-DD)"
                value={birthDateString}
                editable={false}
                pointerEvents="none"
              />
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          {/* Phone */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Celular</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu celular"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Email */}
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

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity 
            style={[styles.continueButton, !isFormValid && styles.disabledButton]} 
            onPress={handleRegister}
            disabled={!isFormValid}
          >
            <Text style={styles.continueButtonText}>Crear una cuenta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={birthDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
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
    paddingTop: 80,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 40,
  },
  brandName: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 20,
    letterSpacing: -1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingRight: 45,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1F2937',
  },
  calendarIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
    fontSize: 20,
  },
  continueButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 18,
    borderRadius: 8,
    marginTop: 30,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
