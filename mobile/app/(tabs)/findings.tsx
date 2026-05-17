import React, { useEffect, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  SafeAreaView, Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter, useFocusEffect } from 'expo-router'
import { FossilInfo } from '@/lib/types'
import { getSavedFossils, removeFossil, isPremiumUser } from '@/lib/storage'
import AsyncStorage from '@react-native-async-storage/async-storage'

const FREE_LIMIT = 3

export default function FindingsScreen() {
  const router = useRouter()
  const [fossils, setFossils] = useState<FossilInfo[]>([])
  const [premium, setPremium] = useState(false)

  useFocusEffect(useCallback(() => { load() }, []))

  async function load() {
    const [f, p] = await Promise.all([getSavedFossils(), isPremiumUser()])
    setFossils(f)
    setPremium(p)
  }

  async function handleDelete(id: string, name: string) {
    Alert.alert('Remove Fossil', `Remove "${name}" from your findings?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          await removeFossil(id)
          load()
        }
      },
    ])
  }

  async function handleViewFossil(fossil: FossilInfo) {
    await AsyncStorage.setItem(`fossil_pending_${fossil.id}`, JSON.stringify(fossil))
    router.push(`/fossil/${fossil.id}`)
  }

  const displayedFossils = premium ? fossils : fossils.slice(0, FREE_LIMIT)
  const lockedCount = !premium ? Math.max(0, fossils.length - FREE_LIMIT) : 0

  if (fossils.length === 0) {
    return (
      <LinearGradient colors={['#0c0a09', '#1c1412']} style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <Text style={styles.title}>My Findings</Text>
          </View>
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={64} color="#292524" />
            <Text style={styles.emptyTitle}>No findings yet</Text>
            <Text style={styles.emptyDesc}>Photograph a fossil to start your collection.</Text>
            <TouchableOpacity style={styles.identifyBtn} onPress={() => router.push('/')} activeOpacity={0.8}>
              <Ionicons name="camera-outline" size={16} color="#fff" />
              <Text style={styles.identifyBtnText}>Identify a Fossil</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={['#0c0a09', '#1c1412']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Findings</Text>
            <Text style={styles.subtitle}>{fossils.length} fossil{fossils.length !== 1 ? 's' : ''} discovered</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/subscribe')} style={styles.premiumBadge}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text style={styles.premiumBadgeText}>Premium</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={displayedFossils}
          keyExtractor={f => f.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => handleViewFossil(item)} activeOpacity={0.8}>
              <Image source={{ uri: item.imageUri }} style={styles.cardImage} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.cardGrad} />
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id, item.name)}>
                <Ionicons name="trash-outline" size={14} color="#ef4444" />
              </TouchableOpacity>
              <View style={styles.cardInfo}>
                <View style={styles.rarityDot} />
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardPeriod} numberOfLines={1}>{item.period}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={lockedCount > 0 ? (
            <View style={styles.lockCard}>
              <Ionicons name="lock-closed" size={28} color="#f59e0b" style={{ marginBottom: 8 }} />
              <Text style={styles.lockTitle}>{lockedCount} more finding{lockedCount > 1 ? 's' : ''} locked</Text>
              <Text style={styles.lockDesc}>Upgrade to Premium to save unlimited fossils.</Text>
              <TouchableOpacity style={styles.unlockBtn} onPress={() => router.push('/subscribe')} activeOpacity={0.8}>
                <Text style={styles.unlockBtnText}>Unlock Premium</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        />
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#f5f5f4' },
  subtitle: { fontSize: 13, color: '#78716c', marginTop: 2 },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#292524', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#44403c' },
  premiumBadgeText: { color: '#f59e0b', fontSize: 12, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#a8a29e', marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#57534e', textAlign: 'center', marginBottom: 24 },
  identifyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#b45309', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12 },
  identifyBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  card: { flex: 1, height: 180, borderRadius: 16, overflow: 'hidden', backgroundColor: '#1c1917' },
  cardImage: { width: '100%', height: '100%' },
  cardGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 90 },
  deleteBtn: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  cardInfo: { position: 'absolute', bottom: 10, left: 10, right: 10 },
  rarityDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#f59e0b', marginBottom: 4 },
  cardName: { fontSize: 13, fontWeight: '700', color: '#f5f5f4' },
  cardPeriod: { fontSize: 11, color: '#a8a29e' },
  lockCard: { margin: 16, backgroundColor: '#1c1917', borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#44403c' },
  lockTitle: { fontSize: 18, fontWeight: '700', color: '#f5f5f4', marginBottom: 6 },
  lockDesc: { fontSize: 13, color: '#78716c', textAlign: 'center', marginBottom: 16 },
  unlockBtn: { backgroundColor: '#b45309', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  unlockBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
