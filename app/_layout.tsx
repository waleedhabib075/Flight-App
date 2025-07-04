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
import { getCurrentUser, supabase } from "../lib/supabase";
import { checkDatabaseSetup, createLikesTable } from "../lib/dbCheck";

type RootStackParamList = {
  Packages: undefined;
  Likes: undefined;
  Profile: undefined;
  Welcome: { setHasSeenWelcome: (value: boolean) => void };
  SignIn: { setIsLoggedIn: (value: boolean) => void };
  CreateAccount: { setIsLoggedIn: (value: boolean) => void };
  PackageDetail: { package: any };
  PaymentMethods: undefined;
  MainTabs: undefined;
  Home: undefined;
};

type ScreenProps = {
  navigation: any;
  route: any;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

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
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // First check database setup
        const dbCheck = await checkDatabaseSetup();
        console.log('Database check result:', dbCheck);
        
        if (!dbCheck.exists) {
          console.log('Database table does not exist, attempting to create...');
          const creationResult = await createLikesTable();
          if (!creationResult.success) {
            console.error('Failed to create database table:', creationResult.error);
            setError('Database setup failed. Please check your connection.');
            return;
          }
        }
        
        setDbReady(true);
        // Then check auth status
        const checkAuthStatus = async () => {
          try {
            setIsCheckingAuth(true);
            
            // Check if the welcome screen has been seen
            const welcomeSeen = await AsyncStorage.getItem("welcomeSeen");
            setHasSeenWelcome(welcomeSeen === "true");
            
            // Check Supabase auth state
            const { user, error } = await getCurrentUser();
            
            if (error) {
              console.error("Error checking auth status:", error);
              setIsLoggedIn(false);
            } else if (user) {
              console.log("User is authenticated:", user.email);
              setIsLoggedIn(true);
              
              // Store user info in AsyncStorage for quick access
              await AsyncStorage.setItem("userEmail", user.email || "");
              if (user.user_metadata?.name) {
                await AsyncStorage.setItem("userName", user.user_metadata.name);
              }
            } else {
              console.log("No authenticated user found");
              setIsLoggedIn(false);
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

        await checkAuthStatus();
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize app. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Set up auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setIsLoggedIn(true);
        await AsyncStorage.setItem("userEmail", session.user.email || "");
        if (session.user.user_metadata?.name) {
          await AsyncStorage.setItem("userName", session.user.user_metadata.name);
        }
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        await AsyncStorage.multiRemove(["userEmail", "userName"]);
      }
    });
    
    // Cleanup function
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (isLoading || !dbReady) {
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
          <Stack.Screen name="SignIn">
            {(props) => (
              <SignInScreen 
                {...props} 
                route={{
                  ...props.route,
                  params: { ...props.route.params, setIsLoggedIn }
                }}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="CreateAccount">
            {(props) => (
              <CreateAccountScreen 
                {...props} 
                route={{
                  ...props.route,
                  params: { ...props.route.params, setIsLoggedIn }
                }}
              />
            )}
          </Stack.Screen>
        </>
      ) : !hasSeenWelcome ? (
        // Show Welcome screen first if not seen yet
        <Stack.Screen name="Welcome">
          {(props) => (
            <WelcomeScreen 
              {...props} 
              route={{
                ...props.route,
                params: { ...props.route.params, setHasSeenWelcome }
              }}
            />
          )}
        </Stack.Screen>
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
