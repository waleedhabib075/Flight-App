"use client"

import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useState } from "react"
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"

const PaymentMethods = ({ route, navigation }) => {
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: "visa", last4: "4242", default: true },
    { id: 2, type: "mastercard", last4: "5555", default: false },
  ])
  const [showAddCard, setShowAddCard] = useState(false)
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")

  // Format card number with spaces every 4 digits
  const formatCardNumber = (text) => {
    return text
      .replace(/\s/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim()
  }

  const handleAddCard = () => {
    // Basic validation
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      Alert.alert("Error", "Please fill in all card details")
      return
    }

    if (cardNumber.replace(/\s/g, "").length !== 16) {
      Alert.alert("Error", "Please enter a valid 16-digit card number")
      return
    }

    // Add the new card
    const last4 = cardNumber.replace(/\s/g, "").slice(-4)
    const cardType = cardNumber.startsWith("4") ? "visa" : "mastercard"

    const newCard = {
      id: Date.now(),
      type: cardType,
      last4,
      default: paymentMethods.length === 0,
    }

    setPaymentMethods([...paymentMethods, newCard])

    // Clear form and hide it
    setCardNumber("")
    setCardName("")
    setExpiryDate("")
    setCvv("")
    setShowAddCard(false)

    Alert.alert("Success", "Your card has been added")
  }

  const setDefaultPaymentMethod = (id) => {
    const updatedMethods = paymentMethods.map((method) => ({
      ...method,
      default: method.id === id,
    }))
    setPaymentMethods(updatedMethods)
  }

  const deletePaymentMethod = (id) => {
    Alert.alert("Delete Card", "Are you sure you want to delete this card?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => {
          const filteredMethods = paymentMethods.filter((method) => method.id !== id)

          // If we deleted the default card and there are other cards, set a new default
          if (paymentMethods.find((method) => method.id === id)?.default && filteredMethods.length > 0) {
            filteredMethods[0].default = true
          }

          setPaymentMethods(filteredMethods)
        },
        style: "destructive",
      },
    ])
  }

  const getCardIcon = (type) => {
    if (type === "visa") return "card-outline"
    if (type === "mastercard") return "card-outline"
    return "card-outline"
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payment Methods</Text>
      </View>

      <LinearGradient
        colors={["#0088CC", "#E91E63"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.headerDivider}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {paymentMethods.map((method) => (
          <View key={method.id} style={styles.cardItem}>
            <View style={styles.cardItemLeft}>
              <Ionicons name={getCardIcon(method.type)} size={32} color="#0088CC" />
              <View style={styles.cardDetails}>
                <Text style={styles.cardType}>
                  {method.type === "visa" ? "Visa" : "MasterCard"} •••• {method.last4}
                </Text>
                {method.default && <Text style={styles.defaultText}>Default</Text>}
              </View>
            </View>

            <View style={styles.cardActions}>
              {!method.default && (
                <TouchableOpacity style={styles.actionButton} onPress={() => setDefaultPaymentMethod(method.id)}>
                  <Text style={styles.actionButtonText}>Set Default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => deletePaymentMethod(method.id)}
              >
                <Ionicons name="trash-outline" size={18} color="#E91E63" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {showAddCard ? (
          <View style={styles.addCardForm}>
            <Text style={styles.formTitle}>Add New Card</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={(text) => {
                  // Only allow digits and limit to 19 chars (16 digits + 3 spaces)
                  const formattedText = formatCardNumber(text.replace(/[^0-9]/g, "").slice(0, 16))
                  setCardNumber(formattedText)
                }}
                keyboardType="number-pad"
                maxLength={19}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={cardName}
                onChangeText={setCardName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={(text) => {
                    // Format as MM/YY
                    text = text.replace(/[^0-9]/g, "").slice(0, 4)
                    if (text.length > 2) {
                      text = `${text.slice(0, 2)}/${text.slice(2)}`
                    }
                    setExpiryDate(text)
                  }}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={cvv}
                  onChangeText={(text) => setCvv(text.replace(/[^0-9]/g, "").slice(0, 3))}
                  keyboardType="number-pad"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => setShowAddCard(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.addButton} onPress={handleAddCard}>
                <Text style={styles.addButtonText}>Add Card</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.addNewButton} onPress={() => setShowAddCard(true)}>
            <Ionicons name="add-circle-outline" size={20} color="#0088CC" />
            <Text style={styles.addNewButtonText}>Add New Payment Method</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
  content: {
    padding: 20,
  },
  cardItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardDetails: {
    marginLeft: 15,
  },
  cardType: {
    fontSize: 16,
    fontWeight: "bold",
  },
  defaultText: {
    fontSize: 12,
    color: "#0088CC",
    marginTop: 4,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#0088CC",
    marginLeft: 8,
  },
  actionButtonText: {
    color: "#0088CC",
    fontSize: 12,
  },
  deleteButton: {
    borderColor: "#E91E63",
    backgroundColor: "rgba(233, 30, 99, 0.1)",
    padding: 8,
  },
  addNewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    backgroundColor: "rgba(0, 136, 204, 0.1)",
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#0088CC",
  },
  addNewButtonText: {
    color: "#0088CC",
    fontSize: 16,
    marginLeft: 8,
  },
  addCardForm: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#0088CC",
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: "#fff",
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#0088CC",
  },
  addButton: {
    backgroundColor: "#0088CC",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
})

export default PaymentMethods
