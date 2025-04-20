"use client";

import CreateAccountScreen from "@/Screens/CreateAccountScreen";
import LikesScreen from "@/Screens/LikesScreen";
import PackageDetailScreen from "@/Screens/PackageDetailScreen";
import PackagesScreen from "@/Screens/PackagesScreen";
import PaymentMethods from "@/Screens/PaymentMethodsScreen";
import ProfileScreen from "@/Screens/ProfileScreen";
import SignInScreen from "@/Screens/SignInScreen";
import WelcomeScreen from "@/Screens/WelcomeScreen";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { getCurrentUser } from "../lib/supabase";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Packages") {
            iconName = "airplane";
          } else if (route.name === "Likes") {
            iconName = "heart";
          } else if (route.name === "Profile") {
            iconName = "person";
          } else {
            iconName = "help";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#E91E63",
        tabBarInactiveTintColor: "#0088CC",
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
        },
        headerShown: false,
        tabBarShowLabel: false,
      })}
    >
      <Tab.Screen name="Packages" component={PackagesScreen} />
      <Tab.Screen name="Likes" component={LikesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is logged in and if they've seen the welcome screen
    const checkStatus = async () => {
      try {
        setIsCheckingAuth(true);

        // First check if the welcome screen has been seen
        const welcomeSeen = await AsyncStorage.getItem("welcomeSeen");
        setHasSeenWelcome(welcomeSeen === "true");

        // Check if we have a stored user email (as a backup auth check)
        const storedEmail = await AsyncStorage.getItem("userEmail");
        const storedName = await AsyncStorage.getItem("userName");

        // Try to get the current user from Supabase
        const { user, error } = await getCurrentUser();

        if (error) {
          console.error("Error checking user status:", error);
          // If there's an error but we have stored user info, consider the user logged in
          if (storedEmail && storedName) {
            console.log("Using stored user info as fallback");
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
            setError(
              typeof error === "object" && error !== null && "message" in error
                ? (error.message as string)
                : "An unknown error occurred"
            );
          }
        } else {
          // If we have a user from Supabase or stored credentials, consider the user logged in
          const isAuthenticated = !!user || (!!storedEmail && !!storedName);
          console.log(
            "Authentication status:",
            isAuthenticated ? "Logged in" : "Not logged in"
          );
          setIsLoggedIn(isAuthenticated);

          // If we have a Supabase user but no stored info, store the info
          if (user && (!storedEmail || !storedName)) {
            await AsyncStorage.setItem("userEmail", user.email || "");
            if (user.user_metadata?.name) {
              await AsyncStorage.setItem("userName", user.user_metadata.name);
            }
          }
        }
      } catch (err) {
        console.error("Error in checkStatus:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
        setIsCheckingAuth(false);
      }
    };

    checkStatus();
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#0088CC" />
        <Text style={{ marginTop: 20, fontSize: 16, color: "#666" }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (error && !isLoggedIn && !isCheckingAuth) {
    console.log("Rendering error state:", error);
  }

  // If we're not logged in but we've seen the welcome screen, show the auth screens
  // If we're logged in but haven't seen the welcome screen, show the welcome screen
  // Otherwise, show the main app

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        // Auth screens
        <>
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            initialParams={{ setIsLoggedIn }}
          />
          <Stack.Screen
            name="CreateAccount"
            component={CreateAccountScreen}
            initialParams={{ setIsLoggedIn }}
          />
        </>
      ) : !hasSeenWelcome ? (
        // Show Welcome screen first if not seen yet
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          initialParams={{ setHasSeenWelcome }}
        />
      ) : (
        // Main app screens
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="PackageDetail"
            component={PackageDetailScreen}
            options={{
              headerShown: true,
              title: "Package Details",
              headerStyle: {
                backgroundColor: "#0088CC",
              },
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="PaymentMethods"
            component={PaymentMethods}
            options={{
              headerShown: true,
              title: "Payment Methods",
              headerStyle: {
                backgroundColor: "#0088CC",
              },
              headerTintColor: "#fff",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
