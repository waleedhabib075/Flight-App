"use client"

import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useState } from "react"
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { signOut, supabase } from "../lib/supabase"
import { getLikesCount } from "../lib/likes"

const ProfileScreen = ({ navigation }) => {
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [likedCount, setLikedCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      // Get user data from Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      let onlineLikes = 0;
      
      if (user) {
        // Set user data from Supabase
        const name = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
        setUserName(name);
        setUserEmail(user.email || '');
        
        // Save to AsyncStorage for offline access
        await AsyncStorage.setItem("userName", name);
        await AsyncStorage.setItem("userEmail", user.email || '');
        
        // Get online likes count from Supabase
        const { count, error } = await getLikesCount(user.id);
        if (!error && count > 0) {
          onlineLikes = count;
        }
      } else {
        // Fallback to AsyncStorage if not logged in
        const name = await AsyncStorage.getItem("userName");
        const email = await AsyncStorage.getItem("userEmail");
        if (name) setUserName(name);
        if (email) setUserEmail(email);
      }

      // Get offline likes count from AsyncStorage
      const likedPackagesJson = await AsyncStorage.getItem("likedPackages");
      const offlineLikes = likedPackagesJson ? JSON.parse(likedPackagesJson).length : 0;

      // Use the maximum between online and offline counts to handle sync issues
      setLikedCount(Math.max(offlineLikes, onlineLikes));
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Fallback to local storage if there's an error with Supabase
      try {
        const likedPackagesJson = await AsyncStorage.getItem("likedPackages");
        const likedPackages = likedPackagesJson ? JSON.parse(likedPackagesJson) : [];
        setLikedCount(likedPackages.length);
      } catch (e) {
        console.error("Error getting local likes:", e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    
    // Add listener for when screen comes into focus
    const unsubscribe = navigation.addListener("focus", () => {
      fetchUserData();
    });

    return unsubscribe;

    // fetchUserData is now called in the useEffect above
  }, [navigation])

  const handlePaymentMethods = () => {
    navigation.navigate("PaymentMethods")
  }

  // Handle logout with Supabase
  const handleLogout = async () => {
    try {
      const { error } = await signOut()
      if (error) throw error
      
      // Clear any remaining local state
      setUserName("")
      setUserEmail("")
      setLikedCount(0)
      
      // Navigate to SignIn
      navigation.navigate("SignIn")
    } catch (error) {
      console.error("Error during logout:", error)
      Alert.alert("Error", "Failed to sign out. Please try again.")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={60} color="#fff" />
        </View>
        <Text style={styles.nameText}>{userName || "Guest"}</Text>
        <Text style={styles.emailText}>{userEmail || "Not signed in"}</Text>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#ff5a5f" />
          ) : (
            <Text style={styles.statValue}>{likedCount}</Text>
          )}
          <Text style={styles.statLabel}>Liked Packages</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={handlePaymentMethods}>
          <Ionicons name="card-outline" size={24} color="#0088CC" style={styles.menuIcon} />
          <Text style={styles.menuText}>Payment Methods</Text>
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
    justifyContent: 'space-between',
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
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#0088CC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 0,
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  emailText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },
  profileSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
