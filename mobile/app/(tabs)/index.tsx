import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ActivityIndicator, Alert, ScrollView, SafeAreaView, Platform,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { identifyFossil } from '@/lib/claude'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function HomeScreen() {
  const router = useRouter()
  const [analyzing, setAnalyzing] = useState(false)
  const [previewUri, setPreviewUri] = useState<string | null>(null)

  async function processImage(uri: string) {
    setPreviewUri(uri)
    setAnalyzing(true)
    try {
      const fossilData = await identifyFossil(uri)
      const id = Date.now().toString()
      const fossil = { ...fossilData, id, imageUri: uri, savedAt: Date.now() }
      await AsyncStorage.setItem(`fossil_pending_${id}`, JSON.stringify(fossil))
      router.push(`/fossil/${id}`)
    } catch (e) {
      Alert.alert('Error', 'Failed to identify fossil. Please try again.')
    } finally {
      setAnalyzing(false)
      setPreviewUri(null)
    }
  }

  async function openCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to photograph fossils.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: false,
    })
    if (!result.canceled) processImage(result.assets[0].uri)
  }

  async function openGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library permission is required.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    })
    if (!result.canceled) processImage(result.assets[0].uri)
  }

  const features = [
    { icon: 'sparkles-outline', title: 'AI Identification', desc: 'Powered by Claude vision AI' },
    { icon: 'book-outline', title: 'Rich History', desc: 'Formation process & geological period' },
    { icon: 'share-outline', title: 'Share Finds', desc: 'Share with the fossil community' },
    { icon: 'star-outline', title: 'Save Collection', desc: 'Build your fossil archive' },
  ]

  return (
    <LinearGradient colors={['#0c0a09', '#1c1412']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="flask-outline" size={28} color="#f59e0b" />
            <Text style={styles.brand}>FossilLens</Text>
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.badge}>
              <Ionicons name="scan-outline" size={14} color="#f59e0b" />
              <Text style={styles.badgeText}>AI-Powered Fossil Identification</Text>
            </View>
            <Text style={styles.heroTitle}>Discover Ancient{'\n'}
              <Text style={styles.heroAccent}>Life in Stone</Text>
            </Text>
            <Text style={styles.heroSub}>
              Photograph any fossil and instantly reveal its name, age, formation story, and scientific significance.
            </Text>
          </View>

          {/* Upload Zone / Analyzing */}
          {analyzing ? (
            <View style={styles.analyzingCard}>
              {previewUri && (
                <Image source={{ uri: previewUri }} style={styles.previewImage} />
              )}
              <ActivityIndicator size="large" color="#f59e0b" style={{ marginBottom: 12 }} />
              <Text style={styles.analyzingTitle}>Analyzing your fossil...</Text>
              <Text style={styles.analyzingSubtitle}>Our AI paleontologist is at work</Text>
            </View>
          ) : (
            <View style={styles.uploadCard}>
              <View style={styles.cameraIconWrap}>
                <Ionicons name="camera-outline" size={40} color="#f59e0b" />
              </View>
              <Text style={styles.uploadTitle}>Take or upload a fossil photo</Text>
              <Text style={styles.uploadSub}>Tap a button below to get started</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.primaryBtn} onPress={openCamera} activeOpacity={0.8}>
                  <Ionicons name="camera" size={18} color="#fff" />
                  <Text style={styles.primaryBtnText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={openGallery} activeOpacity={0.8}>
                  <Ionicons name="image-outline" size={18} color="#d6d3d1" />
                  <Text style={styles.secondaryBtnText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Features */}
          <View style={styles.featuresGrid}>
            {features.map(f => (
              <View key={f.title} style={styles.featureCard}>
                <Ionicons name={f.icon as any} size={24} color="#f59e0b" />
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity style={styles.premiumCta} onPress={() => router.push('/subscribe')} activeOpacity={0.8}>
            <Ionicons name="star" size={20} color="#f59e0b" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.ctaTitle}>Unlock Premium</Text>
              <Text style={styles.ctaDesc}>Save unlimited fossils & share with the community</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#78716c" />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 32, marginTop: 8 },
  brand: { fontSize: 22, fontWeight: '700', color: '#f5f5f4' },
  hero: { marginBottom: 28 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#292524', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', marginBottom: 16, borderWidth: 1, borderColor: '#44403c' },
  badgeText: { color: '#f59e0b', fontSize: 12 },
  heroTitle: { fontSize: 36, fontWeight: '800', color: '#f5f5f4', lineHeight: 44, marginBottom: 12 },
  heroAccent: { color: '#f59e0b' },
  heroSub: { fontSize: 15, color: '#78716c', lineHeight: 22 },
  uploadCard: { backgroundColor: '#1c1917', borderRadius: 20, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#292524', marginBottom: 24 },
  cameraIconWrap: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#292524', borderWidth: 1, borderColor: '#44403c', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  uploadTitle: { fontSize: 18, fontWeight: '600', color: '#e7e5e4', marginBottom: 6 },
  uploadSub: { fontSize: 13, color: '#78716c', marginBottom: 20 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#b45309', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12 },
  primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#292524', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1, borderColor: '#44403c' },
  secondaryBtnText: { color: '#d6d3d1', fontWeight: '600', fontSize: 15 },
  analyzingCard: { backgroundColor: '#1c1917', borderRadius: 20, padding: 36, alignItems: 'center', borderWidth: 1, borderColor: '#292524', marginBottom: 24 },
  previewImage: { width: 120, height: 120, borderRadius: 16, marginBottom: 20, opacity: 0.5 },
  analyzingTitle: { fontSize: 17, fontWeight: '600', color: '#e7e5e4', marginBottom: 6 },
  analyzingSubtitle: { fontSize: 13, color: '#78716c' },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  featureCard: { width: '47%', backgroundColor: '#1c1917', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#292524' },
  featureTitle: { fontSize: 13, fontWeight: '600', color: '#e7e5e4', marginTop: 8, marginBottom: 4 },
  featureDesc: { fontSize: 11, color: '#78716c', lineHeight: 16 },
  premiumCta: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1917', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#44403c' },
  ctaTitle: { fontSize: 15, fontWeight: '600', color: '#e7e5e4', marginBottom: 2 },
  ctaDesc: { fontSize: 12, color: '#78716c' },
})
