import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthService } from "../services/authService";
import { useAuth } from "../hooks/useAuth";

interface EmailVerificationScreenProps {
  onVerificationComplete: () => void;
  onGoBack: () => void;
  onBackToHome: () => void;
  userEmail?: string;
  userPassword?: string;
}

export default function EmailVerificationScreen({
  onVerificationComplete,
  onGoBack,
  onBackToHome,
  userEmail,
  userPassword,
}: EmailVerificationScreenProps) {
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { login } = useAuth();

  // Countdown para reenvío
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (!userEmail) {
      Alert.alert("Error", "No se encontró el email del usuario");
      return;
    }

    setIsResending(true);
    try {
      console.log(
        "📧 [EmailVerificationScreen] Reenviando email de verificación a:",
        userEmail
      );

      // Llamar al endpoint de reenvío de Supabase
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/resend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
          },
          body: JSON.stringify({
            type: "signup",
            email: userEmail,
          }),
        }
      );

      if (response.ok) {
        Alert.alert(
          "Email enviado",
          "Se ha enviado un nuevo email de verificación. Revisa tu bandeja de entrada y spam."
        );
        setCountdown(60); // 60 segundos antes de poder reenviar
      } else {
        throw new Error("Error al reenviar email");
      }
    } catch (error) {
      console.error(
        "❌ [EmailVerificationScreen] Error reenviando email:",
        error
      );
      Alert.alert("Error", "No se pudo reenviar el email de verificación");
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!userEmail || !userPassword) {
      Alert.alert("Error", "Faltan credenciales del usuario");
      return;
    }

    setIsChecking(true);
    try {
      console.log(
        "🔍 [EmailVerificationScreen] Verificando si el email fue confirmado para:",
        userEmail
      );

      // Intentar hacer login para verificar si el email fue confirmado
      const loginResult = await login({
        email: userEmail,
        password: userPassword,
      });

      if (loginResult) {
        console.log(
          "✅ [EmailVerificationScreen] Email verificado exitosamente, usuario logueado"
        );
        Alert.alert(
          "¡Verificación exitosa!",
          "Tu email ha sido verificado correctamente. Ahora puedes continuar con la verificación de identidad.",
          [
            {
              text: "Continuar",
              onPress: onVerificationComplete,
            },
          ]
        );
      } else {
        Alert.alert(
          "Email no verificado",
          "Tu email aún no ha sido verificado. Por favor, revisa tu correo y haz clic en el enlace de verificación."
        );
      }
    } catch (error: any) {
      console.error(
        "❌ [EmailVerificationScreen] Error verificando email:",
        error
      );
      if (error.message.includes("Email not confirmed")) {
        Alert.alert(
          "Email no verificado",
          "Tu email aún no ha sido verificado. Por favor, revisa tu correo y haz clic en el enlace de verificación."
        );
      } else {
        Alert.alert("Error", "No se pudo verificar el estado del email");
      }
    } finally {
      setIsChecking(false);
    }
  };

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
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>📧</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Verifica tu Email</Text>

        {/* Description */}
        <Text style={styles.description}>
          Hemos enviado un enlace de verificación a tu correo electrónico:
          {"\n\n"}
          <Text style={styles.emailText}>{userEmail}</Text>
          {"\n\n"}
          Por favor, revisa tu bandeja de entrada y haz clic en el enlace para
          verificar tu cuenta.
        </Text>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <View style={styles.instruction}>
            <Text style={styles.instructionIcon}>1️⃣</Text>
            <Text style={styles.instructionText}>
              Abre tu aplicación de correo
            </Text>
          </View>
          <View style={styles.instruction}>
            <Text style={styles.instructionIcon}>2️⃣</Text>
            <Text style={styles.instructionText}>Busca el email de Ugüee</Text>
          </View>
          <View style={styles.instruction}>
            <Text style={styles.instructionIcon}>3️⃣</Text>
            <Text style={styles.instructionText}>
              Haz clic en "Confirmar email"
            </Text>
          </View>
          <View style={styles.instruction}>
            <Text style={styles.instructionIcon}>4️⃣</Text>
            <Text style={styles.instructionText}>
              Regresa aquí y presiona "Ya verifiqué"
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Buttons - Fixed at bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleCheckVerification}
          disabled={isChecking}
        >
          {isChecking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>YA VERIFIQUÉ MI EMAIL</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            countdown > 0 && styles.disabledButton,
          ]}
          onPress={handleResendEmail}
          disabled={isResending || countdown > 0}
        >
          {isResending ? (
            <ActivityIndicator color="#8B5CF6" />
          ) : (
            <Text style={styles.secondaryButtonText}>
              {countdown > 0 ? `Reenviar en ${countdown}s` : "Reenviar email"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.tertiaryButton} onPress={onGoBack}>
          <Text style={styles.tertiaryButtonText}>Volver atrás</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
    zIndex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: "#8B5CF6",
    fontSize: 16,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Add padding to the bottom to prevent content from being hidden behind buttons
  },
  headerDots: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
    marginTop: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: "#8B5CF6",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1F2937",
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 32,
  },
  emailText: {
    fontWeight: "600",
    color: "#8B5CF6",
  },
  instructionsContainer: {
    marginBottom: 40,
  },
  instruction: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  instructionIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  instructionText: {
    fontSize: 14,
    color: "#4B5563",
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  primaryButton: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
    minHeight: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#8B5CF6",
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
    minHeight: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#8B5CF6",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  tertiaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 8,
  },
  tertiaryButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
});
