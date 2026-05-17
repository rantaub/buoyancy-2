import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  SafeAreaView, Share, Alert, Dimensions,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { FossilInfo } from '@/lib/types'
import { saveFossil, getSavedFossils, removeFossil } from '@/lib/storage'

const { width } = Dimensions.get('window')

const RARITY_COLORS: Record<string, string> = {
  Common: '#9ca3af',
  Uncommon: '#4ade80',
  Rare: '#60a5fa',
  'Very Rare': '#c084fc',
  Exceptional: '#f59e0b',
}

export default function FossilDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [fossil, setFossil] = useState<FossilInfo | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    loadFossil()
  }, [id])

  async function loadFossil() {
    const data = await AsyncStorage.getItem(`fossil_pending_${id}`)
    if (data) {
      const parsed: FossilInfo = JSON.parse(data)
      setFossil(parsed)
      const saved = await getSavedFossils()
      setIsSaved(saved.some(f => f.id === id))
    }
  }

  async function handleSave() {
    if (!fossil) return
    if (isSaved) {
      await removeFossil(fossil.id)
      setIsSaved(false)
      Alert.alert('Removed', 'Fossil removed from your findings.')
    } else {
      await saveFossil(fossil)
      setIsSaved(true)
      Alert.alert('Saved!', `${fossil.name} added to your findings.`)
    }
  }

  async function handleShare() {
    if (!fossil) return
    await Share.share({
      message: `I found a ${fossil.name} (${fossil.scientificName}) fossil from the ${fossil.period} period using FossilLens!\n\nAge: ${fossil.age}\n${fossil.funFact}`,
      title: `Fossil Find: ${fossil.name}`,
    })
  }

  if (!fossil) {
    return (
      <LinearGradient colors={['#0c0a09', '#1c1412']} style={styles.container}>
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#78716c', fontSize: 16 }}>Loading fossil...</Text>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  const sections = [
    { icon: 'layers-outline', label: 'Formation Process', content: fossil.formationProcess },
    { icon: 'leaf-outline', label: 'Original Habitat', content: fossil.habitat },
    { icon: 'location-outline', label: 'Global Distribution', content: fossil.geography },
    { icon: 'shield-checkmark-outline', label: 'Scientific Significance', content: fossil.significance },
    { icon: 'bulb-outline', label: 'Did You Know?', content: fossil.funFact },
  ]

  return (
    <LinearGradient colors={['#0c0a09', '#1c1412']} style={styles.container}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroWrap}>
          <Image source={{ uri: fossil.imageUri }} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient colors={['transparent', '#0c0a09']} style={styles.heroGrad} />
          <SafeAreaView style={styles.headerBtns}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#f5f5f4" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
                <Ionicons name="share-outline" size={22} color="#f5f5f4" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={handleSave}>
                <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={22} color={isSaved ? '#f59e0b' : '#f5f5f4'} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          {/* Title Card */}
          <View style={styles.titleCard}>
            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fossilName}>{fossil.name}</Text>
                <Text style={styles.scientificName}>{fossil.scientificName}</Text>
              </View>
              <View style={[styles.rarityBadge, { borderColor: RARITY_COLORS[fossil.rarity] + '60' }]}>
                <Text style={[styles.rarityText, { color: RARITY_COLORS[fossil.rarity] }]}>{fossil.rarity}</Text>
              </View>
            </View>
            <Text style={styles.description}>{fossil.description}</Text>

            {/* Stats */}
            <View style={styles.statsGrid}>
              {[
                { icon: 'time-outline', label: 'Period', value: fossil.period },
                { icon: 'layers-outline', label: 'Age', value: fossil.age },
                { icon: 'resize-outline', label: 'Size', value: fossil.size },
                { icon: 'restaurant-outline', label: 'Diet', value: fossil.diet },
              ].map(stat => (
                <View key={stat.label} style={styles.statCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <Ionicons name={stat.icon as any} size={12} color="#78716c" />
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Info Sections */}
          {sections.map(section => (
            <View key={section.label} style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconWrap}>
                  <Ionicons name={section.icon as any} size={18} color="#f59e0b" />
                </View>
                <Text style={styles.sectionTitle}>{section.label}</Text>
              </View>
              <Text style={styles.sectionContent}>{section.content}</Text>
            </View>
          ))}

          {/* Save CTA */}
          <View style={styles.saveCta}>
            <Ionicons name="star" size={24} color="#f59e0b" style={{ marginBottom: 8 }} />
            <Text style={styles.ctaTitle}>Add to Your Collection</Text>
            <Text style={styles.ctaDesc}>Save this fossil and build your personal paleontology archive.</Text>
            <View style={styles.ctaBtns}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
                <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={16} color="#fff" />
                <Text style={styles.saveBtnText}>{isSaved ? 'Saved!' : 'Save Finding'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
                <Ionicons name="share-outline" size={16} color="#d6d3d1" />
                <Text style={styles.shareBtnText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroWrap: { height: 300, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 },
  headerBtns: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  titleCard: { backgroundColor: '#1c1917', borderRadius: 20, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: '#292524' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  fossilName: { fontSize: 28, fontWeight: '800', color: '#f5f5f4' },
  scientificName: { fontSize: 16, color: '#f59e0b', fontStyle: 'italic', marginTop: 2 },
  rarityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.3)', marginTop: 4 },
  rarityText: { fontSize: 11, fontWeight: '600' },
  description: { fontSize: 14, color: '#a8a29e', lineHeight: 21, marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: { width: '47%', backgroundColor: '#0c0a09', borderRadius: 12, padding: 10 },
  statLabel: { fontSize: 10, color: '#78716c' },
  statValue: { fontSize: 12, fontWeight: '500', color: '#e7e5e4' },
  sectionCard: { backgroundColor: '#1c1917', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#292524' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  sectionIconWrap: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#0c0a09', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#e7e5e4' },
  sectionContent: { fontSize: 14, color: '#a8a29e', lineHeight: 21 },
  saveCta: { backgroundColor: '#1c1917', borderRadius: 20, padding: 24, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#292524' },
  ctaTitle: { fontSize: 18, fontWeight: '700', color: '#f5f5f4', marginBottom: 6 },
  ctaDesc: { fontSize: 13, color: '#78716c', textAlign: 'center', marginBottom: 16, lineHeight: 19 },
  ctaBtns: { flexDirection: 'row', gap: 10 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#b45309', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10 },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#292524', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10, borderWidth: 1, borderColor: '#44403c' },
  shareBtnText: { color: '#d6d3d1', fontWeight: '600', fontSize: 14 },
})
