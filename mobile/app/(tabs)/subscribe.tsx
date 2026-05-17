import React, { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { setPremium } from '@/lib/storage'

export default function SubscribeScreen() {
  const router = useRouter()
  const [isAnnual, setIsAnnual] = useState(false)
  const [activating, setActivating] = useState(false)

  async function handleSubscribe(plan: 'free' | 'premium') {
    if (plan === 'free') { router.push('/findings'); return }
    setActivating(true)
    await new Promise(r => setTimeout(r, 1500))
    await setPremium(true)
    setActivating(false)
    router.push('/findings')
  }

  const freeFeatures = [
    { text: '5 identifications per day', included: true },
    { text: 'Save up to 3 findings', included: true },
    { text: 'Basic fossil info', included: true },
    { text: 'Share via link', included: true },
    { text: 'Unlimited saves', included: false },
    { text: 'Expert analysis', included: false },
    { text: 'Community feed', included: false },
  ]

  const premiumFeatures = [
    { text: 'Unlimited identifications', included: true },
    { text: 'Unlimited findings saved', included: true },
    { text: 'Detailed expert analysis', included: true },
    { text: 'Share + community feed', included: true },
    { text: 'Export to PDF reports', included: true },
    { text: 'Priority AI processing', included: true },
    { text: 'Offline access', included: true },
  ]

  const benefits = [
    { icon: 'infinite-outline', title: 'Unlimited Everything', desc: 'No caps on identifications or saves' },
    { icon: 'book-outline', title: 'Expert Reports', desc: 'Detailed scientific analysis' },
    { icon: 'people-outline', title: 'Community', desc: 'Share with fossil hunters worldwide' },
    { icon: 'cloud-offline-outline', title: 'Offline Mode', desc: 'Access collection anywhere' },
  ]

  return (
    <LinearGradient colors={['#0c0a09', '#1c1412']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <Ionicons name="flash" size={14} color="#f59e0b" />
              <Text style={styles.badgeText}>Unlock the full experience</Text>
            </View>
            <Text style={styles.title}>Choose Your Plan</Text>
            <Text style={styles.subtitle}>Start free, upgrade when ready</Text>

            {/* Toggle */}
            <View style={styles.toggle}>
              <TouchableOpacity style={[styles.toggleBtn, !isAnnual && styles.toggleActive]} onPress={() => setIsAnnual(false)}>
                <Text style={[styles.toggleText, !isAnnual && styles.toggleTextActive]}>Monthly</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.toggleBtn, isAnnual && styles.toggleActiveAmber]} onPress={() => setIsAnnual(true)}>
                <Text style={[styles.toggleText, isAnnual && styles.toggleTextActive]}>Annual </Text>
                <Text style={{ fontSize: 10, color: '#f59e0b' }}>Save 37%</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Free Plan */}
          <View style={styles.planCard}>
            <View style={styles.planTop}>
              <View style={styles.planIcon}>
                <Ionicons name="camera-outline" size={20} color="#a8a29e" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.planName}>Explorer</Text>
                <Text style={styles.planDesc}>Perfect for casual fossil hunters</Text>
              </View>
            </View>
            <Text style={styles.planPrice}>$0 <Text style={styles.planPeriod}>forever</Text></Text>
            {freeFeatures.map(f => (
              <View key={f.text} style={styles.featureRow}>
                <View style={[styles.check, f.included ? styles.checkIncluded : styles.checkExcluded]}>
                  <Ionicons name="checkmark" size={10} color={f.included ? '#f59e0b' : '#44403c'} />
                </View>
                <Text style={[styles.featureText, !f.included && styles.featureTextExcluded]}>{f.text}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.freePlanBtn} onPress={() => handleSubscribe('free')} activeOpacity={0.8}>
              <Text style={styles.freePlanBtnText}>Continue Free</Text>
            </TouchableOpacity>
          </View>

          {/* Premium Plan */}
          <View style={styles.premiumCard}>
            <LinearGradient colors={['#78350f', '#1c1412']} style={StyleSheet.absoluteFill} borderRadius={20} />
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>Most Popular</Text>
            </View>
            <View style={styles.planTop}>
              <View style={[styles.planIcon, { backgroundColor: '#92400e' }]}>
                <Ionicons name="star" size={20} color="#f59e0b" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.planName, { color: '#fff' }]}>Paleontologist</Text>
                <Text style={[styles.planDesc, { color: '#fcd34d' }]}>For serious fossil enthusiasts</Text>
              </View>
            </View>
            <Text style={[styles.planPrice, { color: '#fff' }]}>
              {isAnnual ? '$5' : '$8'} <Text style={[styles.planPeriod, { color: '#fcd34d' }]}>{isAnnual ? '/mo, billed annually' : '/month'}</Text>
            </Text>
            {premiumFeatures.map(f => (
              <View key={f.text} style={styles.featureRow}>
                <View style={[styles.check, { backgroundColor: '#92400e', borderColor: '#b45309' }]}>
                  <Ionicons name="checkmark" size={10} color="#f59e0b" />
                </View>
                <Text style={[styles.featureText, { color: '#e7e5e4' }]}>{f.text}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.premiumPlanBtn} onPress={() => handleSubscribe('premium')} disabled={activating} activeOpacity={0.8}>
              <Text style={styles.premiumPlanBtnText}>{activating ? 'Activating...' : 'Get Premium'}</Text>
            </TouchableOpacity>
          </View>

          {/* Benefits */}
          <View style={styles.benefitsGrid}>
            {benefits.map(b => (
              <View key={b.title} style={styles.benefitCard}>
                <Ionicons name={b.icon as any} size={22} color="#f59e0b" />
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.benefitDesc}>{b.desc}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 24 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#292524', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 12, borderWidth: 1, borderColor: '#44403c' },
  badgeText: { color: '#f59e0b', fontSize: 12 },
  title: { fontSize: 30, fontWeight: '800', color: '#f5f5f4', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#78716c', marginBottom: 16 },
  toggle: { flexDirection: 'row', backgroundColor: '#1c1917', borderRadius: 14, padding: 4, borderWidth: 1, borderColor: '#292524' },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  toggleActive: { backgroundColor: '#292524' },
  toggleActiveAmber: { backgroundColor: '#b45309' },
  toggleText: { color: '#78716c', fontSize: 14, fontWeight: '500' },
  toggleTextActive: { color: '#f5f5f4' },
  planCard: { backgroundColor: '#1c1917', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#292524' },
  premiumCard: { borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#b45309', overflow: 'hidden', position: 'relative' },
  popularBadge: { position: 'absolute', top: -1, right: 20, backgroundColor: '#b45309', paddingHorizontal: 12, paddingVertical: 4, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
  popularText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  planTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 12 },
  planIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#292524', alignItems: 'center', justifyContent: 'center' },
  planName: { fontSize: 18, fontWeight: '700', color: '#f5f5f4' },
  planDesc: { fontSize: 12, color: '#78716c' },
  planPrice: { fontSize: 36, fontWeight: '800', color: '#f5f5f4', marginBottom: 16 },
  planPeriod: { fontSize: 14, color: '#78716c', fontWeight: '400' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  check: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  checkIncluded: { backgroundColor: '#292524', borderColor: '#b45309' },
  checkExcluded: { backgroundColor: '#0c0a09', borderColor: '#292524' },
  featureText: { fontSize: 13, color: '#d6d3d1', flex: 1 },
  featureTextExcluded: { color: '#57534e', textDecorationLine: 'line-through' },
  freePlanBtn: { marginTop: 16, backgroundColor: '#292524', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#44403c' },
  freePlanBtnText: { color: '#d6d3d1', fontWeight: '600', fontSize: 15 },
  premiumPlanBtn: { marginTop: 16, backgroundColor: '#b45309', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  premiumPlanBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  benefitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  benefitCard: { width: '47%', backgroundColor: '#1c1917', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#292524' },
  benefitTitle: { fontSize: 12, fontWeight: '600', color: '#e7e5e4', marginTop: 8, marginBottom: 4, textAlign: 'center' },
  benefitDesc: { fontSize: 10, color: '#78716c', textAlign: 'center' },
})
