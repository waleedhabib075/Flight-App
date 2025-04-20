import AsyncStorage from "@react-native-async-storage/async-storage"

// Fallback authentication functions when Supabase isn't configured
export const signUp = async (email, password, name) => {
    try {
        // Simple validation
        if (!email || !password || !name) {
            return { data: null, error: { message: "Email, password, and name are required" } }
        }

        // Check if user already exists
        const users = await AsyncStorage.getItem("users")
        const parsedUsers = users ? JSON.parse(users) : []

        if (parsedUsers.some((user) => user.email === email)) {
            return { data: null, error: { message: "User already exists" } }
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            email,
            password, // In a real app, you would hash this
            name,
            created_at: new Date().toISOString(),
        }

        // Save user
        await AsyncStorage.setItem("users", JSON.stringify([...parsedUsers, newUser]))

        // Create session
        const session = {
            user: {
                id: newUser.id,
                email: newUser.email,
                user_metadata: { name: newUser.name },
            },
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        }

        await AsyncStorage.setItem("session", JSON.stringify(session))

        return { data: { user: newUser, session }, error: null }
    } catch (error) {
        return { data: null, error }
    }
}

export const signIn = async (email, password) => {
    try {
        // Simple validation
        if (!email || !password) {
            return { data: null, error: { message: "Email and password are required" } }
        }

        // Get users
        const users = await AsyncStorage.getItem("users")
        const parsedUsers = users ? JSON.parse(users) : []

        // Find user
        const user = parsedUsers.find((user) => user.email === email && user.password === password)

        if (!user) {
            return { data: null, error: { message: "Invalid login credentials" } }
        }

        // Create session
        const session = {
            user: {
                id: user.id,
                email: user.email,
                user_metadata: { name: user.name },
            },
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        }

        await AsyncStorage.setItem("session", JSON.stringify(session))

        return { data: { user, session }, error: null }
    } catch (error) {
        return { data: null, error }
    }
}

export const signOut = async () => {
    try {
        await AsyncStorage.removeItem("session")
        return { error: null }
    } catch (error) {
        return { error }
    }
}

export const getCurrentUser = async () => {
    try {
        const sessionData = await AsyncStorage.getItem("session")

        if (!sessionData) {
            return { user: null, error: null }
        }

        const session = JSON.parse(sessionData)

        // Check if session is expired
        if (new Date(session.expires_at) < new Date()) {
            await AsyncStorage.removeItem("session")
            return { user: null, error: null }
        }

        return { user: session.user, error: null }
    } catch (error) {
        return { user: null, error }
    }
}
