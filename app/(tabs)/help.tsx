import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/ThemeContext';

export default function HelpScreen() {
  const { colors } = useTheme();

  const faqs = [
    {
      question: 'How do I add a new plant?',
      answer: 'To add a new plant, go to the Plants tab and tap the "+" button. Fill in the plant details and save.',
    },
    {
      question: 'How do I set watering reminders?',
      answer: 'When adding or editing a plant, you can set watering frequency and the app will automatically remind you.',
    },
    {
      question: 'Can I share my plants with others?',
      answer: 'Yes! You can share your plant collection by tapping the share button in the Home tab.',
    },
    {
      question: 'How do I change my profile picture?',
      answer: 'Go to your Profile tab and tap on your current profile picture to change it.',
    },
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Us</Text>
        <View style={styles.contactItem}>
          <Ionicons name="mail-outline" size={24} color={colors.primary} />
          <Text style={[styles.contactText, { color: colors.text }]}>support@iwetmyplants.com</Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="call-outline" size={24} color={colors.primary} />
          <Text style={[styles.contactText, { color: colors.text }]}>+1 (555) 123-4567</Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="time-outline" size={24} color={colors.primary} />
          <Text style={[styles.contactText, { color: colors.text }]}>Monday - Friday: 9:00 AM - 5:00 PM</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={[styles.question, { color: colors.text }]}>{faq.question}</Text>
            <Text style={[styles.answer, { color: colors.text + '80' }]}>{faq.answer}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>App Information</Text>
        <Text style={[styles.infoText, { color: colors.text + '80' }]}>
          iWetMyPlants v1.0.0
        </Text>
        <Text style={[styles.infoText, { color: colors.text + '80' }]}>
          © 2025 iWetMyPlants. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactText: {
    marginLeft: 15,
    fontSize: 16,
  },
  faqItem: {
    marginBottom: 20,
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  answer: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 10,
  },
}); 