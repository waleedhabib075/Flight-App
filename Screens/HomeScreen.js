"use client"

import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useState } from "react"
import { FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

import 'react-datepicker/dist/react-datepicker.css'

// Dummy data for popular destinations
const popularDestinations = [
    {
        id: "1",
        city: "New York",
        country: "USA",
        image:
            "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    },
    {
        id: "2",
        city: "London",
        country: "UK",
        image:
            "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    },
    {
        id: "3",
        city: "Paris",
        country: "France",
        image:
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    },
    {
        id: "4",
        city: "Tokyo",
        country: "Japan",
        image:
            "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    },
]

// Dummy data for cities
const cities = [
    { id: "1", name: "New York", code: "NYC" },
    { id: "2", name: "London", code: "LHR" },
    { id: "3", name: "Paris", code: "CDG" },
    { id: "4", name: "Tokyo", code: "HND" },
    { id: "5", name: "Dubai", code: "DXB" },
    { id: "6", name: "Singapore", code: "SIN" },
    { id: "7", name: "Los Angeles", code: "LAX" },
    { id: "8", name: "Sydney", code: "SYD" },
    { id: "9", name: "Hong Kong", code: "HKG" },
    { id: "10", name: "Berlin", code: "BER" },
]

const HomeScreen = ({ navigation }) => {
    const [tripType, setTripType] = useState("roundTrip")
    const [fromCity, setFromCity] = useState("New York")
    const [toCity, setToCity] = useState("London")
    const [fromCityCode, setFromCityCode] = useState("NYC")
    const [toCityCode, setToCityCode] = useState("LHR")
    const [departureDate, setDepartureDate] = useState(new Date())
    const [returnDate, setReturnDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    const [passengers, setPassengers] = useState(1)
    const [travelClass, setTravelClass] = useState("Economy")

    const [showFromModal, setShowFromModal] = useState(false)
    const [showToModal, setShowToModal] = useState(false)
    const [showDepartureDatePicker, setShowDepartureDatePicker] = useState(false)
    const [showReturnDatePicker, setShowReturnDatePicker] = useState(false)
    const [showPassengersModal, setShowPassengersModal] = useState(false)

    const handleSearch = () => {
        // Navigate to flight list with search parameters
        navigation.navigate("FlightList", {
            tripType,
            fromCity,
            toCity,
            fromCityCode,
            toCityCode,
            departureDate,
            returnDate: tripType === "roundTrip" ? returnDate : null,
            passengers,
            travelClass,
        })
    }

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };
    const renderCityItem = (item, setCity, setCityCode, closeModal) => {
        return (
            <TouchableOpacity
                style={styles.cityItem}
                onPress={() => {
                    setCity(item.name)
                    setCityCode(item.code)
                    closeModal()
                }}
            >
                <Text style={styles.cityName}>{item.name}</Text>
                <Text style={styles.cityCode}>{item.code}</Text>
            </TouchableOpacity>
        )
    }

    const renderDestinationItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.destinationCard}
                onPress={() => {
                    setToCity(item.city)
                    setToCityCode(cities.find((city) => city.name === item.city)?.code || "")
                    handleSearch()
                }}
            >
                <Image source={{ uri: item.image }} style={styles.destinationImage} />
                <View style={styles.destinationInfo}>
                    <Text style={styles.destinationCity}>{item.city}</Text>
                    <Text style={styles.destinationCountry}>{item.country}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Text style={styles.greeting}>Hello, Traveler</Text>
                        <Text style={styles.headerTitle}>Where would you like to fly?</Text>
                    </View>
                    <TouchableOpacity style={styles.notificationIcon}>
                        <Ionicons name="notifications-outline" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchCard}>
                    <View style={styles.tripTypeContainer}>
                        <TouchableOpacity
                            style={[styles.tripTypeButton, tripType === "roundTrip" && styles.tripTypeButtonActive]}
                            onPress={() => setTripType("roundTrip")}
                        >
                            <Text style={[styles.tripTypeText, tripType === "roundTrip" && styles.tripTypeTextActive]}>
                                Round Trip
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tripTypeButton, tripType === "oneWay" && styles.tripTypeButtonActive]}
                            onPress={() => setTripType("oneWay")}
                        >
                            <Text style={[styles.tripTypeText, tripType === "oneWay" && styles.tripTypeTextActive]}>One Way</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.locationContainer}>
                        <TouchableOpacity style={styles.locationInput} onPress={() => setShowFromModal(true)}>
                            <View style={styles.locationIconContainer}>
                                <View style={styles.locationDot} />
                            </View>
                            <View style={styles.locationTextContainer}>
                                <Text style={styles.locationLabel}>From</Text>
                                <Text style={styles.locationText}>{fromCity}</Text>
                                <Text style={styles.locationCode}>{fromCityCode}</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.locationSeparator}>
                            <Ionicons name="swap-vertical" size={24} color="#0066CC" />
                        </View>

                        <TouchableOpacity style={styles.locationInput} onPress={() => setShowToModal(true)}>
                            <View style={styles.locationIconContainer}>
                                <View style={[styles.locationDot, { backgroundColor: "#FF6B6B" }]} />
                            </View>
                            <View style={styles.locationTextContainer}>
                                <Text style={styles.locationLabel}>To</Text>
                                <Text style={styles.locationText}>{toCity}</Text>
                                <Text style={styles.locationCode}>{toCityCode}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.dateContainer}>
                        <TouchableOpacity style={styles.dateInput} onPress={() => setShowDepartureDatePicker(true)}>
                            <Ionicons name="calendar-outline" size={20} color="#666" />
                            <View style={styles.dateTextContainer}>
                                <Text style={styles.dateLabel}>Departure</Text>
                                <Text style={styles.dateText}>{formatDate(departureDate, "EEE, MMM d")}</Text>
                            </View>
                        </TouchableOpacity>

                        {tripType === "roundTrip" && (
                            <TouchableOpacity style={styles.dateInput} onPress={() => setShowReturnDatePicker(true)}>
                                <Ionicons name="calendar-outline" size={20} color="#666" />
                                <View style={styles.dateTextContainer}>
                                    <Text style={styles.dateLabel}>Return</Text>
                                    <Text style={styles.dateText}>{formatDate(returnDate, "EEE, MMM d")}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity style={styles.passengersInput} onPress={() => setShowPassengersModal(true)}>
                        <Ionicons name="person-outline" size={20} color="#666" />
                        <View style={styles.passengersTextContainer}>
                            <Text style={styles.passengersLabel}>Passengers & Class</Text>
                            <Text style={styles.passengersText}>
                                {passengers} {passengers === 1 ? "Passenger" : "Passengers"}, {travelClass}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                        <Text style={styles.searchButtonText}>Search Flights</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.popularSection}>
                    <Text style={styles.sectionTitle}>Popular Destinations</Text>
                    <FlatList
                        data={popularDestinations}
                        renderItem={renderDestinationItem}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.destinationList}
                    />
                </View>
            </ScrollView>

            {/* From City Modal */}
            <Modal visible={showFromModal} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Departure City</Text>
                            <TouchableOpacity onPress={() => setShowFromModal(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={cities}
                            renderItem={({ item }) =>
                                renderCityItem(item, setFromCity, setFromCityCode, () => setShowFromModal(false))
                            }
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.modalList}
                        />
                    </View>
                </View>
            </Modal>

            {/* To City Modal */}
            <Modal visible={showToModal} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Destination City</Text>
                            <TouchableOpacity onPress={() => setShowToModal(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={cities}
                            renderItem={({ item }) => renderCityItem(item, setToCity, setToCityCode, () => setShowToModal(false))}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.modalList}
                        />
                    </View>
                </View>
            </Modal>

            {/* Passengers Modal */}
            <Modal visible={showPassengersModal} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Passengers & Class</Text>
                            <TouchableOpacity onPress={() => setShowPassengersModal(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.passengersModalContent}>
                            <View style={styles.passengerCountContainer}>
                                <Text style={styles.passengerCountLabel}>Passengers</Text>
                                <View style={styles.passengerCountControls}>
                                    <TouchableOpacity
                                        style={styles.passengerCountButton}
                                        onPress={() => setPassengers(Math.max(1, passengers - 1))}
                                    >
                                        <Ionicons name="remove" size={20} color="#0066CC" />
                                    </TouchableOpacity>
                                    <Text style={styles.passengerCount}>{passengers}</Text>
                                    <TouchableOpacity style={styles.passengerCountButton} onPress={() => setPassengers(passengers + 1)}>
                                        <Ionicons name="add" size={20} color="#0066CC" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.travelClassContainer}>
                                <Text style={styles.travelClassLabel}>Travel Class</Text>
                                <View style={styles.travelClassOptions}>
                                    {["Economy", "Business", "First"].map((classType) => (
                                        <TouchableOpacity
                                            key={classType}
                                            style={[styles.travelClassOption, travelClass === classType && styles.travelClassOptionSelected]}
                                            onPress={() => setTravelClass(classType)}
                                        >
                                            <Text
                                                style={[
                                                    styles.travelClassOptionText,
                                                    travelClass === classType && styles.travelClassOptionTextSelected,
                                                ]}
                                            >
                                                {classType}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <TouchableOpacity style={styles.applyButton} onPress={() => setShowPassengersModal(false)}>
                                <Text style={styles.applyButtonText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Date Pickers */}
            {showDepartureDatePicker && (
                <DateTimePicker
                    value={departureDate}
                    mode="date"
                    display="default"
                    minimumDate={new Date()}
                    onChange={(event, selectedDate) => {
                        setShowDepartureDatePicker(false)
                        if (selectedDate) {
                            setDepartureDate(selectedDate)
                            // If return date is before the new departure date, update it
                            if (returnDate < selectedDate) {
                                setReturnDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))
                            }
                        }
                    }}
                />
            )}

            {showReturnDatePicker && (
                <DateTimePicker
                    value={returnDate}
                    mode="date"
                    display="default"
                    minimumDate={new Date(departureDate.getTime() + 24 * 60 * 60 * 1000)}
                    onChange={(event, selectedDate) => {
                        setShowReturnDatePicker(false)
                        if (selectedDate) {
                            setReturnDate(selectedDate)
                        }
                    }}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: "#fff",
    },
    headerContent: {
        flex: 1,
    },
    greeting: {
        fontSize: 16,
        color: "#666",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginTop: 5,
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
    },
    searchCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        margin: 20,
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tripTypeContainer: {
        flexDirection: "row",
        marginBottom: 20,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        padding: 4,
    },
    tripTypeButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        borderRadius: 6,
    },
    tripTypeButtonActive: {
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    tripTypeText: {
        fontSize: 14,
        color: "#666",
    },
    tripTypeTextActive: {
        color: "#0066CC",
        fontWeight: "600",
    },
    locationContainer: {
        marginBottom: 15,
    },
    locationInput: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
    },
    locationIconContainer: {
        width: 24,
        alignItems: "center",
        marginRight: 10,
    },
    locationDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#0066CC",
    },
    locationTextContainer: {
        flex: 1,
    },
    locationLabel: {
        fontSize: 12,
        color: "#666",
    },
    locationText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    locationCode: {
        fontSize: 12,
        color: "#666",
        marginTop: 2,
    },
    locationSeparator: {
        alignItems: "center",
        marginVertical: 5,
    },
    dateContainer: {
        flexDirection: "row",
        marginBottom: 15,
    },
    dateInput: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        marginRight: 10,
    },
    dateTextContainer: {
        marginLeft: 10,
    },
    dateLabel: {
        fontSize: 12,
        color: "#666",
    },
    dateText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginTop: 2,
    },
    passengersInput: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        marginBottom: 20,
    },
    passengersTextContainer: {
        marginLeft: 10,
    },
    passengersLabel: {
        fontSize: 12,
        color: "#666",
    },
    passengersText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginTop: 2,
    },
    searchButton: {
        backgroundColor: "#0066CC",
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: "center",
    },
    searchButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    popularSection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
    },
    destinationList: {
        paddingRight: 20,
    },
    destinationCard: {
        width: 160,
        marginRight: 15,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    destinationImage: {
        width: "100%",
        height: 100,
    },
    destinationInfo: {
        padding: 10,
    },
    destinationCity: {
        fontSize: 16,
        fontWeight: "bold",
    },
    destinationCountry: {
        fontSize: 12,
        color: "#666",
        marginTop: 2,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "80%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    modalList: {
        padding: 20,
    },
    cityItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    cityName: {
        fontSize: 16,
    },
    cityCode: {
        fontSize: 14,
        color: "#666",
    },
    passengersModalContent: {
        padding: 20,
    },
    passengerCountContainer: {
        marginBottom: 20,
    },
    passengerCountLabel: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 10,
    },
    passengerCountControls: {
        flexDirection: "row",
        alignItems: "center",
    },
    passengerCountButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#0066CC",
        justifyContent: "center",
        alignItems: "center",
    },
    passengerCount: {
        fontSize: 16,
        fontWeight: "600",
        marginHorizontal: 20,
    },
    travelClassContainer: {
        marginBottom: 20,
    },
    travelClassLabel: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 10,
    },
    travelClassOptions: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    travelClassOption: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        marginHorizontal: 5,
    },
    travelClassOptionSelected: {
        borderColor: "#0066CC",
        backgroundColor: "#E6F0FF",
    },
    travelClassOptionText: {
        color: "#666",
    },
    travelClassOptionTextSelected: {
        color: "#0066CC",
        fontWeight: "600",
    },
    applyButton: {
        backgroundColor: "#0066CC",
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: "center",
        marginTop: 10,
    },
    applyButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
})

export default HomeScreen
