"use client"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useState } from "react"
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

// Sample packages data to add
const samplePackages = [
    {
        id: "pkg1",
        destination: "Bali, Indonesia",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800",
        price: "£1,299",
        duration: "7 days"
    },
    {
        id: "pkg2",
        destination: "Santorini, Greece",
        image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800",
        price: "£1,899",
        duration: "10 days"
    },
    {
        id: "pkg3",
        destination: "Tokyo, Japan",
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800",
        price: "£2,199",
        duration: "12 days"
    },
    {
        id: "pkg4",
        destination: "Paris, France",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800",
        price: "£1,599",
        duration: "8 days"
    },
    {
        id: "pkg5",
        destination: "New York, USA",
        image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800",
        price: "£1,399",
        duration: "6 days"
    }
]

const LikesScreen = ({ navigation }) => {
    const [likedPackages, setLikedPackages] = useState([])

    // Function to add sample packages
    const addSamplePackages = async () => {
        try {
            // Update state
            setLikedPackages(samplePackages)

            // Save to AsyncStorage
            await AsyncStorage.setItem("likedPackages", JSON.stringify(samplePackages))
            console.log("Sample packages added successfully")
        } catch (error) {
            console.log("Error adding sample packages:", error)
        }
    }

    // Function to clear all liked packages
    const clearLikedPackages = async () => {
        try {
            setLikedPackages([])
            await AsyncStorage.removeItem("likedPackages")
            console.log("Liked packages cleared")
        } catch (error) {
            console.log("Error clearing liked packages:", error)
        }
    }

    useEffect(() => {
        const fetchLikedPackages = async () => {
            try {
                const likedPackagesJson = await AsyncStorage.getItem("likedPackages")
                if (likedPackagesJson) {
                    setLikedPackages(JSON.parse(likedPackagesJson))
                }
            } catch (error) {
                console.log("Error fetching liked packages:", error)
            }
        }

        fetchLikedPackages()

        // Add listener for when screen comes into focus
        const unsubscribe = navigation.addListener("focus", () => {
            fetchLikedPackages()
        })

        return unsubscribe
    }, [navigation])

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.packageItem}
            onPress={() => navigation.navigate("PackageDetail", { package: item })}
        >
            <Text style={styles.destinationText}>{item.destination}</Text>
            <Image source={{ uri: item.image }} style={styles.packageImage} />
            <View style={styles.packageInfo}>
                <Text style={styles.packagePrice}>{item.price}</Text>
                <Text style={styles.packageDuration}>{item.duration}</Text>
            </View>
            <LinearGradient
                colors={["#0088CC", "#E91E63"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.divider}
            />
        </TouchableOpacity>
    )

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Likes</Text>
            </View>
            <LinearGradient
                colors={["#0088CC", "#E91E63"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.headerDivider}
            />
            <FlatList
                data={likedPackages}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No liked packages yet</Text>
                        <Text style={styles.emptySubtext}>Swipe right on packages you like</Text>
                        <TouchableOpacity
                            style={styles.sampleButton}
                            onPress={addSamplePackages}
                        >
                            <Text style={styles.sampleButtonText}>Load Sample Packages</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
            {likedPackages.length > 0 && (
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearLikedPackages}
                >
                    <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
            )}
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
    listContent: {
        padding: 15,
        paddingBottom: 80, // Add padding for the clear button
    },
    packageItem: {
        marginBottom: 30,
        borderRadius: 10,
        backgroundColor: "#f9f9f9",
        padding: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    destinationText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#0088CC",
        marginBottom: 10,
        marginLeft: 10,
    },
    packageImage: {
        width: "100%",
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
    },
    packageInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: 10,
        marginBottom: 10,
    },
    packagePrice: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#E91E63",
    },
    packageDuration: {
        fontSize: 16,
        color: "#666",
    },
    divider: {
        height: 4,
        width: "100%",
        borderRadius: 2,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        marginTop: 50,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#666",
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 16,
        color: "#999",
        textAlign: "center",
        marginBottom: 20,
    },
    sampleButton: {
        backgroundColor: "#0088CC",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10,
    },
    sampleButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    clearButton: {
        position: "absolute",
        bottom: 20,
        alignSelf: "center",
        backgroundColor: "#E91E63",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    clearButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
})

export default LikesScreen