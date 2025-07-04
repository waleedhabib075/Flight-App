"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useState } from "react"
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

const PackageDetailScreen = ({ route, navigation }) => {
  const { package: packageData } = route.params
  const [isLiked, setIsLiked] = useState(false)
  

  useEffect(() => {
    const checkIfLiked = async () => {
      try {
        const likedPackagesJson = await AsyncStorage.getItem("likedPackages")
        if (likedPackagesJson) {
          const likedPackages = JSON.parse(likedPackagesJson)
          setIsLiked(likedPackages.some((p) => p.id === packageData.id))
        }
      } catch (error) {
        console.log("Error checking if package is liked:", error)
      }
    }

    checkIfLiked()
  }, [packageData])

  const toggleLike = async () => {
    try {
      const likedPackagesJson = await AsyncStorage.getItem("likedPackages")
      const likedPackages = likedPackagesJson ? JSON.parse(likedPackagesJson) : []

      if (isLiked) {
        // Remove from likes
        const updatedLikes = likedPackages.filter((p) => p.id !== packageData.id)
        await AsyncStorage.setItem("likedPackages", JSON.stringify(updatedLikes))
        setIsLiked(false)
      } else {
        // Add to likes
        if (!likedPackages.some((p) => p.id === packageData.id)) {
          const updatedLikes = [...likedPackages, packageData]
          await AsyncStorage.setItem("likedPackages", JSON.stringify(updatedLikes))
          setIsLiked(true)
        }
      }
    } catch (error) {
      console.log("Error toggling like:", error)
    }
  }

  const handleBookNow = () => {
    navigation.navigate("PaymentMethods", { package: packageData })
  }



  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: packageData.image }} style={styles.heroImage} />

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.destinationTitle}>{packageData.destination}</Text>
            <TouchableOpacity onPress={toggleLike} style={styles.likeButton}>
              <Ionicons name={isLiked ? "heart" : "heart-outline"} size={28} color={isLiked ? "#E91E63" : "#666"} />
            </TouchableOpacity>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.priceValue}>{packageData.price}</Text>
          </View>

          <LinearGradient
            colors={["#0088CC", "#E91E63"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.divider}
          />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{packageData.description}</Text>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={24} color="#0088CC" />
              <Text style={styles.detailText}>7 days, 6 nights</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="airplane-outline" size={24} color="#0088CC" />
              <Text style={styles.detailText}>Flight included</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="bed-outline" size={24} color="#0088CC" />
              <Text style={styles.detailText}>4-star accommodation</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="restaurant-outline" size={24} color="#0088CC" />
              <Text style={styles.detailText}>Breakfast included</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroImage: {
    width: "100%",
    height: 300,
  },
  contentContainer: {
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  destinationTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0088CC",
  },
  likeButton: {
    padding: 10,
  },
  priceContainer: {
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 16,
    color: "#666",
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  divider: {
    height: 4,
    width: "100%",
    borderRadius: 2,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0088CC",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
    marginBottom: 20,
  },
  detailsContainer: {
    marginBottom: 30,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  detailText: {
    fontSize: 16,
    marginLeft: 15,
    color: "#444",
  },
  bookButton: {
    backgroundColor: "#0088CC",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
})

export default PackageDetailScreen
