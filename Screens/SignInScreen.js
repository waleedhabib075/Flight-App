"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { signIn } from "../lib/supabase"

const SignInScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const { setIsLoggedIn } = route.params

  const handleSignIn = async () => {
    // Clear previous errors
    setErrorMessage("")

    // Simple validation
    if (!email || !password) {
      setErrorMessage("Please fill in all fields")
      return
    }

    setIsLoading(true)

    try {
      console.log("Attempting to sign in with:", email)
      const { data, error } = await signIn(email, password)

      if (error) {
        console.error("Sign in error:", error)
        setErrorMessage(error.message || "Failed to sign in")
        return
      }

      if (data?.session) {
        console.log("Sign in successful, session created")
        // Store user info in AsyncStorage for app usage
        await AsyncStorage.setItem("userEmail", email)

        if (data.user?.user_metadata?.name) {
          await AsyncStorage.setItem("userName", data.user.user_metadata.name)
        }

        setIsLoggedIn(true)
      } else {
        console.log("Sign in response:", data)
        setErrorMessage("No session returned. Please try again.")
      }
    } catch (error) {
      console.error("Unexpected error during sign in:", error)
      setErrorMessage("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <View style={styles.content}>
          <Text style={styles.title}>Sign In</Text>

          <LinearGradient
            colors={["#0088CC", "#E91E63"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.divider}
          />

          <View style={styles.form}>
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[styles.signInButton, isLoading && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              <Text style={styles.signInButtonText}>{isLoading ? "Signing In..." : "Sign In"}</Text>
            </TouchableOpacity>

            <View style={styles.createAccountContainer}>
              <Text style={styles.createAccountText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("CreateAccount")} disabled={isLoading}>
                <Text style={styles.createAccountLink}>Create one</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#0088CC",
    marginBottom: 20,
  },
  divider: {
    height: 4,
    width: "60%",
    borderRadius: 2,
    marginBottom: 40,
  },
  form: {
    width: "100%",
  },
  errorContainer: {
    backgroundColor: "rgba(233, 30, 99, 0.1)",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E91E63",
  },
  errorText: {
    color: "#E91E63",
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  signInButton: {
    backgroundColor: "#0088CC",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: "#84C6E5", // lighter blue for disabled state
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  createAccountContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  createAccountText: {
    color: "#666",
    fontSize: 16,
  },
  createAccountLink: {
    color: "#0088CC",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default SignInScreen
