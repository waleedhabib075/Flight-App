import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

const WelcomeScreen = ({ navigation, route }) => {
    const { setHasSeenWelcome } = route.params

    const handleStart = async () => {
        try {
            await AsyncStorage.setItem("welcomeSeen", "true")
            setHasSeenWelcome(true)
        } catch (error) {
            console.log("Error saving welcome status:", error)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Welcome</Text>

                <LinearGradient
                    colors={["#0088CC", "#E91E63"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.divider}
                />

                <View style={styles.instructionsContainer}>
                    <Text style={styles.instructions}>
                        Swipe right on packages to add them to your Likes, swipe left if the package presented isn't for you, or
                        click the package onscreen to view more information.
                    </Text>
                </View>

                <TouchableOpacity style={styles.startButton} onPress={handleStart}>
                    <Text style={styles.startButtonText}>Start</Text>
                </TouchableOpacity>

                <View style={styles.mapIconsContainer}>
                    <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/684/684908.png" }} style={styles.mapIcon1} />
                    <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/684/684908.png" }} style={styles.mapIcon2} />
                    <Image
                        source={{ uri: "https://cdn-icons-png.flaticon.com/512/1539/1539591.png" }}
                        style={styles.dottedLine}
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 48,
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
    instructionsContainer: {
        width: "90%",
        marginBottom: 40,
    },
    instructions: {
        fontSize: 22,
        color: "#0088CC",
        textAlign: "center",
        lineHeight: 32,
    },
    startButton: {
        backgroundColor: "#0088CC",
        paddingVertical: 15,
        paddingHorizontal: 60,
        borderRadius: 30,
        marginBottom: 40,
    },
    startButtonText: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
    },
    mapIconsContainer: {
        position: "absolute",
        bottom: 40,
        right: 20,
        width: 120,
        height: 120,
    },
    mapIcon1: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 40,
        height: 40,
        tintColor: "#E91E63",
    },
    mapIcon2: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: 40,
        height: 40,
        tintColor: "#E91E63",
    },
    dottedLine: {
        position: "absolute",
        width: 80,
        height: 80,
        tintColor: "#E91E63",
    },
})

export default WelcomeScreen
