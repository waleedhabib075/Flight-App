"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { CommonActions } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useState } from "react"
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { signOut } from "../lib/supabase"

const ProfileScreen = ({ navigation }) => {
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [likedCount, setLikedCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        const name = await AsyncStorage.getItem("userName")
        const email = await AsyncStorage.getItem("userEmail")
        const likedPackagesJson = await AsyncStorage.getItem("likedPackages")

        if (name) setUserName(name)
        if (email) setUserEmail(email)

        const likedPackages = likedPackagesJson ? JSON.parse(likedPackagesJson) : []
        setLikedCount(likedPackages.length)
      } catch (error) {
        console.log("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()

    // Add listener for when screen comes into focus
    const unsubscribe = navigation.addListener("focus", () => {
      fetchUserData()
    })

    return unsubscribe
  }, [navigation])

  const handlePaymentMethods = () => {
    navigation.navigate("PaymentMethods")
  }

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            // Try to sign out from Supabase
            const { error } = await signOut()
            if (error) {
              console.log("Error signing out from Supabase:", error)
              // Continue with local logout even if Supabase logout fails
            }

            // Clear user data from AsyncStorage
            await AsyncStorage.removeItem("userToken")
            await AsyncStorage.removeItem("userName")
            await AsyncStorage.removeItem("userEmail")

            // Navigate back to login screen
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "SignIn" }],
              }),
            )
          } catch (error) {
            console.log("Error logging out:", error)
            Alert.alert("Error", "Failed to logout. Please try again.")
          }
        },
      },
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <LinearGradient
        colors={["#0088CC", "#E91E63"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.headerDivider}
      />

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{userName ? userName.charAt(0).toUpperCase() : "G"}</Text>
        </View>
        <Text style={styles.nameText}>{userName || "Guest"}</Text>
        <Text style={styles.emailText}>{userEmail || "Not signed in"}</Text>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{likedCount}</Text>
          <Text style={styles.statLabel}>Liked Packages</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color="#0088CC" style={styles.menuIcon} />
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handlePaymentMethods}>
          <Ionicons name="card-outline" size={24} color="#0088CC" style={styles.menuIcon} />
          <Text style={styles.menuText}>Payment Methods</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#0088CC" style={styles.menuIcon} />
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#E91E63" style={styles.menuIcon} />
          <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0088CC",
  },
  headerDivider: {
    height: 4,
    width: "60%",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#0088CC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  emailText: {
    fontSize: 16,
    color: "#666",
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0088CC",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  menuSection: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  logoutText: {
    color: "#E91E63",
  },
})

export default ProfileScreen
