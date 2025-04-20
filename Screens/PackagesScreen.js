"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRef, useState } from "react"
import {
    Animated,
    Dimensions,
    Image,
    PanResponder,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"

const SCREEN_WIDTH = Dimensions.get("window").width
const SWIPE_THRESHOLD = 120

// Dummy data for travel packages
const travelPackages = [
    {
        id: "1",
        destination: "Fiji",
        price: "£750",
        image:
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
        description:
            "Experience the crystal clear waters and white sandy beaches of Fiji. Perfect for relaxation and adventure.",
    },
    {
        id: "2",
        destination: "Bali",
        price: "£650",
        image:
            "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
        description: "Discover the beauty of Bali with its lush rice terraces, stunning temples, and vibrant culture.",
    },
    {
        id: "3",
        destination: "Santorini",
        price: "£900",
        image:
            "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
        description:
            "Visit the iconic white and blue buildings of Santorini and enjoy breathtaking sunsets over the Aegean Sea.",
    },
    {
        id: "4",
        destination: "Maldives",
        price: "£1200",
        image:
            "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
        description: "Stay in overwater bungalows and swim with marine life in the crystal clear waters of the Maldives.",
    },
    {
        id: "5",
        destination: "Thailand",
        price: "£550",
        image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
        description: "Explore the beautiful beaches, ancient temples, and vibrant street life of Thailand.",
    },
]

const PackagesScreen = ({ navigation }) => {
    const [packages, setPackages] = useState(travelPackages)
    const position = useRef(new Animated.ValueXY()).current
    const [currentIndex, setCurrentIndex] = useState(0)
    const [swipeDirection, setSwipeDirection] = useState(null)

    const saveLikedPackage = async (package_) => {
        try {
            const likedPackagesJson = await AsyncStorage.getItem("likedPackages")
            const likedPackages = likedPackagesJson ? JSON.parse(likedPackagesJson) : []

            // Check if package is already liked
            if (!likedPackages.some((p) => p.id === package_.id)) {
                const updatedLikedPackages = [...likedPackages, package_]
                await AsyncStorage.setItem("likedPackages", JSON.stringify(updatedLikedPackages))
            }
        } catch (error) {
            console.log("Error saving liked package:", error)
        }
    }

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gesture) => {
                position.setValue({ x: gesture.dx, y: gesture.dy })
                // Update swipe direction for visual feedback
                if (gesture.dx > 25) {
                    setSwipeDirection("right")
                } else if (gesture.dx < -25) {
                    setSwipeDirection("left")
                } else {
                    setSwipeDirection(null)
                }
            },
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dx > SWIPE_THRESHOLD) {
                    swipeRight()
                } else if (gesture.dx < -SWIPE_THRESHOLD) {
                    swipeLeft()
                } else {
                    resetPosition()
                }
                setSwipeDirection(null)
            },
        }),
    ).current

    const swipeRight = () => {
        Animated.timing(position, {
            toValue: { x: SCREEN_WIDTH + 100, y: 0 },
            duration: 300,
            useNativeDriver: false,
        }).start(() => {
            const currentPackage = packages[currentIndex]
            saveLikedPackage(currentPackage)
            nextCard()
        })
    }

    const swipeLeft = () => {
        Animated.timing(position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
            duration: 300,
            useNativeDriver: false,
        }).start(nextCard)
    }

    const resetPosition = () => {
        Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            useNativeDriver: false,
        }).start()
    }

    const nextCard = () => {
        setCurrentIndex((prevIndex) => prevIndex + 1)
        position.setValue({ x: 0, y: 0 })
    }

    const handleCardPress = () => {
        if (currentIndex < packages.length) {
            navigation.navigate("PackageDetail", { package: packages[currentIndex] })
        }
    }

    const renderNoMoreCards = () => {
        return (
            <View style={styles.noMoreCardsContainer}>
                <Text style={styles.noMoreCardsText}>No More Packages</Text>
                <TouchableOpacity style={styles.resetButton} onPress={() => setCurrentIndex(0)}>
                    <Text style={styles.resetButtonText}>Start Over</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const renderCard = () => {
        if (currentIndex >= packages.length) {
            return renderNoMoreCards()
        }

        const package_ = packages[currentIndex]

        return (
            <TouchableOpacity activeOpacity={0.9} onPress={handleCardPress}>
                <Animated.View
                    style={[
                        styles.cardContainer,
                        {
                            transform: [
                                { translateX: position.x },
                                {
                                    rotate: position.x.interpolate({
                                        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
                                        outputRange: ["-10deg", "0deg", "10deg"],
                                        extrapolate: "clamp",
                                    }),
                                },
                            ],
                        },
                    ]}
                    {...panResponder.panHandlers}
                >
                    <View style={styles.swipeIndicatorContainer}>
                        {swipeDirection === "left" && (
                            <View style={[styles.swipeIndicator, styles.swipeIndicatorLeft]}>
                                <Ionicons name="close-circle" size={60} color="rgba(233, 30, 99, 0.8)" />
                            </View>
                        )}
                        {swipeDirection === "right" && (
                            <View style={[styles.swipeIndicator, styles.swipeIndicatorRight]}>
                                <Ionicons name="heart-circle" size={60} color="rgba(0, 136, 204, 0.8)" />
                            </View>
                        )}
                    </View>

                    <Image source={{ uri: package_.image }} style={styles.cardImage} />
                    <View style={styles.cardContent}>
                        <Text style={styles.destinationText}>{package_.destination}</Text>
                        <Text style={styles.priceText}>{package_.price}</Text>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Packages</Text>
            </View>

            <View style={styles.instructions}>
                <Text style={styles.instructionsText}>
                    <Ionicons name="arrow-forward" size={16} color="#0088CC" /> Swipe right to like
                </Text>
                <Text style={styles.instructionsText}>
                    <Ionicons name="arrow-back" size={16} color="#E91E63" /> Swipe left to skip
                </Text>
                <Text style={styles.instructionsText}>
                    <Ionicons name="finger-print" size={16} color="#0088CC" /> Tap for details
                </Text>
            </View>

            <View style={styles.cardArea}>{renderCard()}</View>
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
    instructions: {
        paddingHorizontal: 20,
        marginBottom: 20,
        alignItems: "center",
    },
    instructionsText: {
        fontSize: 14,
        color: "#666",
        marginBottom: 5,
    },
    cardArea: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 70, // Space for tab bar
    },
    cardContainer: {
        width: SCREEN_WIDTH - 40,
        height: 520,
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#E91E63",
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    swipeIndicatorContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
    },
    swipeIndicator: {
        padding: 10,
        borderRadius: 40,
    },
    swipeIndicatorRight: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    swipeIndicatorLeft: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    cardImage: {
        width: "100%",
        height: "85%",
        resizeMode: "cover",
    },
    cardContent: {
        padding: 15,
        alignItems: "center",
    },
    destinationText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#0088CC",
    },
    priceText: {
        fontSize: 20,
        color: "#333",
        marginTop: 5,
    },
    noMoreCardsContainer: {
        width: SCREEN_WIDTH - 40,
        height: 500,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f8f8",
        borderRadius: 20,
        padding: 20,
    },
    noMoreCardsText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#666",
        marginBottom: 20,
    },
    resetButton: {
        backgroundColor: "#0088CC",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    resetButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
})

export default PackagesScreen
