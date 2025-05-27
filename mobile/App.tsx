import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  WelcomeScreen,
  LoginScreen,
  RegisterScreen,
  VerifyIdentityScreen, 
  CameraPermissionsScreen, 
  StartVerificationScreen 
} from './screens';

type Screen = 'welcome' | 'login' | 'register' | 'verify-identity' | 'permissions' | 'start-verification' | 'verification-in-progress';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');

  const handleBackToHome = () => {
    setCurrentScreen('welcome');
  };

  const handleLogin = () => {
    setCurrentScreen('login');
  };

  const handleRegister = () => {
    setCurrentScreen('register');
  };

  const handleLoginSubmit = (email: string, password: string) => {
    // Aquí puedes integrar con tu sistema de autenticación
    console.log('Login attempt:', { email, password });
    // Por ahora, ir a verificación después del login
    setCurrentScreen('verify-identity');
  };

  const handleRegisterSubmit = (data: { name: string; email: string; password: string }) => {
    // Aquí puedes integrar con tu sistema de registro
    console.log('Register attempt:', data);
    // Por ahora, ir a verificación después del registro
    setCurrentScreen('verify-identity');
  };

  const handleContinueFromVerifyIdentity = () => {
    setCurrentScreen('permissions');
  };

  const handleSkipVerifyIdentity = () => {
    setCurrentScreen('welcome');
  };

  const handleAllowPermissions = () => {
    setCurrentScreen('start-verification');
  };

  const handleDenyPermissions = () => {
    setCurrentScreen('verify-identity');
  };

  const handleStartVerificationProcess = () => {
    setCurrentScreen('verification-in-progress');
  };

  const handleGoBackFromStart = () => {
    setCurrentScreen('permissions');
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return (
          <WelcomeScreen
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        );
      case 'login':
        return (
          <LoginScreen
            onLogin={handleLoginSubmit}
            onGoToRegister={handleRegister}
            onBackToHome={handleBackToHome}
          />
        );
      case 'register':
        return (
          <RegisterScreen
            onRegister={handleRegisterSubmit}
            onGoToLogin={handleLogin}
            onBackToHome={handleBackToHome}
          />
        );
      case 'verify-identity':
        return (
          <VerifyIdentityScreen
            onContinue={handleContinueFromVerifyIdentity}
            onSkip={handleSkipVerifyIdentity}
            onBackToHome={handleBackToHome}
          />
        );
      case 'permissions':
        return (
          <CameraPermissionsScreen
            onAllow={handleAllowPermissions}
            onDeny={handleDenyPermissions}
            onBackToHome={handleBackToHome}
          />
        );
      case 'start-verification':
        return (
          <StartVerificationScreen
            onStartVerification={handleStartVerificationProcess}
            onGoBack={handleGoBackFromStart}
            onBackToHome={handleBackToHome}
          />
        );
      case 'verification-in-progress':
        return (
          <VerifyIdentityScreen
            onContinue={() => console.log('Verificación completada')}
            onSkip={() => setCurrentScreen('welcome')}
            onBackToHome={handleBackToHome}
          />
        );
      default:
        return (
          <WelcomeScreen
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        );
    }
  };

  return (
    <>
      <StatusBar style="auto" />
      {renderCurrentScreen()}
    </>
  );
}
