import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient } from "@supabase/supabase-js"
import "react-native-url-polyfill/auto"

// Directly use the hardcoded values
const supabaseUrl = "https://elbnsfjalgbkeqrnqjhl.supabase.co"
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsYm5zZmphbGdia2Vxcm5xamhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxMzM2MjgsImV4cCI6MjA2MDcwOTYyOH0.fsGu8tAE7FKE5-JCok0zZ1ILN-AtOOpn9F6BVMxP0vg"

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})

// Helper functions for authentication
export const signUp = async (email, password, name) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                },
            },
        })

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error("Sign up error:", error)
        // Ensure error has a message property
        return {
            data: null,
            error: {
                message: error instanceof Error ? error.message : "An error occurred during sign up",
            },
        }
    }
}

export const signIn = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error("Sign in error:", error)
        // Ensure error has a message property
        return {
            data: null,
            error: {
                message: error instanceof Error ? error.message : "An error occurred during sign in",
            },
        }
    }
}

export const signOut = async () => {
    try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        return { error: null }
    } catch (error) {
        console.error("Sign out error:", error)
        // Ensure error has a message property
        return {
            error: {
                message: error instanceof Error ? error.message : "An error occurred during sign out",
            },
        }
    }
}

export const getCurrentUser = async () => {
    try {
        // First check if we have a session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
            console.log("Session error:", sessionError)
            return { user: null, error: null } // Return null user but no error to prevent app crash
        }

        // If no session, return null user without error
        if (!sessionData.session) {
            console.log("No active session found")
            return { user: null, error: null }
        }

        // If we have a session, get the user
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser()

        if (error) throw error
        return { user, error: null }
    } catch (error) {
        // Don't treat missing session as an error
        if (error instanceof Error && error.message.includes("Auth session missing")) {
            console.log("Auth session missing - not treating as error")
            return { user: null, error: null }
        }

        console.error("Get current user error:", error)
        // Ensure error has a message property
        return {
            user: null,
            error: {
                message: error instanceof Error ? error.message : "An error occurred while getting current user",
            },
        }
    }
}
