import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

/*
 * Fruit data for the floating emojis scattered around the logo & background.
 */
const FRUIT_EMOJIS = ['🍎', '🍊', '🥭', '🍇', '🍌'];
const BG_FRUITS = ['🍎', '🍊', '🥭', '🍇', '🍌', '🍑', '🍓', '🫐', '🍒', '🍋'];
const FEATURE_PILLS = ['AI Diagnosis', '🍎🍊🥭🍇🍌', 'Real-time Analysis'];

/**
 * AnimatedSplash — a vibrant, fruity splash screen that mirrors the web app's
 * phased-animation splash (gradient, logo pop-in, floating fruits, progress bar).
 *
 * Props:
 *  - onFinish()  — called after the animation completes (≈3.2 s)
 *  - holdOpen    — if true, keep the splash visible (progress keeps spinning)
 */
export default function AnimatedSplash({ onFinish, holdOpen = false }) {
  /* ─── Phase state (mirrors web: 0→1→2→3→4) ─── */
  const [phase, setPhase] = useState(0);

  /* ─── Animated values ─── */
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const brandY = useRef(new Animated.Value(30)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const pillsY = useRef(new Animated.Value(20)).current;
  const pillsOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const progressOpacity = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const versionOpacity = useRef(new Animated.Value(0)).current;

  // Floating fruit positions around logo
  const fruitAnims = useRef(
    FRUIT_EMOJIS.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(16),
      translateX: new Animated.Value(0),
    }))
  ).current;

  // Background floating fruit blobs
  const bgFruits = useRef(
    BG_FRUITS.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(0),
    }))
  ).current;

  /* ─── Pulse ring loop ─── */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  /* ─── Background fruit floating ─── */
  useEffect(() => {
    bgFruits.forEach((f, i) => {
      // Fade in staggered
      Animated.timing(f.opacity, {
        toValue: 0.12,
        duration: 800,
        delay: i * 150,
        useNativeDriver: true,
      }).start();
      // Gentle float
      Animated.loop(
        Animated.sequence([
          Animated.timing(f.translateY, {
            toValue: -12,
            duration: 2200 + i * 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(f.translateY, {
            toValue: 12,
            duration: 2200 + i * 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [bgFruits]);

  /* ─── Phase orchestration ─── */
  useEffect(() => {
    // Phase 0 → Logo pop-in
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    const t1 = setTimeout(() => {
      setPhase(1);
      // Phase 1 → Brand text + fruit emojis around logo
      Animated.parallel([
        Animated.timing(brandOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(brandY, { toValue: 0, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        ...fruitAnims.map((f, i) =>
          Animated.parallel([
            Animated.timing(f.opacity, { toValue: 1, duration: 400, delay: i * 80, useNativeDriver: true }),
            Animated.timing(f.translateY, { toValue: 0, duration: 400, delay: i * 80, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          ])
        ),
      ]).start();
    }, 400);

    const t2 = setTimeout(() => {
      setPhase(2);
      // Phase 2 → Feature pills + version
      Animated.parallel([
        Animated.timing(pillsOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(pillsY, { toValue: 0, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(versionOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();
    }, 1000);

    const t3 = setTimeout(() => {
      setPhase(3);
      // Phase 3 → Progress bar
      Animated.timing(progressOpacity, { toValue: 1, duration: 300, useNativeDriver: false }).start();
      Animated.timing(progressWidth, { toValue: 1, duration: 1200, easing: Easing.out(Easing.ease), useNativeDriver: false }).start();
    }, 1800);

    const t4 = setTimeout(() => {
      setPhase(4);
      // Phase 4 → Fade out
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* If holdOpen, keep visible at phase 3 */
  const displayFadeOut = holdOpen ? 1 : fadeOut;

  /* ─── Background fruit positions (random scatter) ─── */
  const bgPositions = [
    { top: '5%', left: '8%', size: 38 },
    { top: '12%', right: '12%', size: 28 },
    { top: '25%', left: '75%', size: 34 },
    { top: '35%', left: '5%', size: 26 },
    { bottom: '30%', right: '8%', size: 36 },
    { bottom: '20%', left: '15%', size: 30 },
    { bottom: '10%', right: '20%', size: 24 },
    { top: '50%', left: '85%', size: 28 },
    { bottom: '40%', left: '3%', size: 22 },
    { top: '8%', left: '50%', size: 26 },
  ];

  /* ─── Positions for emojis around the logo ─── */
  const fruitPositions = [
    { top: -14, right: -14 },    // 🍎 top-right
    { bottom: -10, left: -14 },  // 🍊 bottom-left
    { top: -10, left: -18 },     // 🥭 top-left
    { bottom: -14, right: -18 }, // 🍇 bottom-right
    { top: '40%', right: -26 },  // 🍌 mid-right
  ];

  return (
    <Animated.View style={[styles.container, { opacity: displayFadeOut }]}>
      {/* ─── Gradient background ─── */}
      <View style={styles.gradientBg}>
        {/* Soft glowing orbs */}
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />
        <View style={[styles.orb, styles.orb3]} />

        {/* Dot grid overlay */}
        <View style={styles.dotGrid} />

        {/* Background floating fruits */}
        {BG_FRUITS.map((emoji, i) => {
          const pos = bgPositions[i];
          return (
            <Animated.Text
              key={`bg-${i}`}
              style={[
                styles.bgFruit,
                {
                  fontSize: pos.size,
                  top: pos.top,
                  bottom: pos.bottom,
                  left: pos.left,
                  right: pos.right,
                  opacity: bgFruits[i].opacity,
                  transform: [{ translateY: bgFruits[i].translateY }],
                },
              ]}
            >
              {emoji}
            </Animated.Text>
          );
        })}
      </View>

      {/* ─── Content ─── */}
      <View style={styles.content}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoBox}>
            <Ionicons name="medical" size={48} color="#fff" />
          </View>
          {/* Pulse ring */}
          <Animated.View
            style={[
              styles.pulseRing,
              {
                opacity: Animated.multiply(
                  logoOpacity,
                  pulseAnim.interpolate({ inputRange: [1, 1.5], outputRange: [0.3, 0] })
                ),
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          {/* Floating fruit emojis around logo */}
          {FRUIT_EMOJIS.map((emoji, i) => (
            <Animated.Text
              key={`fruit-${i}`}
              style={[
                styles.fruitEmoji,
                {
                  ...fruitPositions[i],
                  opacity: fruitAnims[i].opacity,
                  transform: [{ translateY: fruitAnims[i].translateY }],
                },
              ]}
            >
              {emoji}
            </Animated.Text>
          ))}
        </Animated.View>

        {/* Brand text */}
        <Animated.View
          style={[
            styles.brandContainer,
            {
              opacity: brandOpacity,
              transform: [{ translateY: brandY }],
            },
          ]}
        >
          <Text style={styles.brandText}>
            Fruit<Text style={styles.brandAccent}>MD</Text>
          </Text>
          <View style={styles.taglineRow}>
            <Text style={styles.heartEmoji}>❤️</Text>
            <Text style={styles.tagline}>The Fruit Doctor</Text>
          </View>
        </Animated.View>

        {/* Feature pills */}
        <Animated.View
          style={[
            styles.pillsRow,
            {
              opacity: pillsOpacity,
              transform: [{ translateY: pillsY }],
            },
          ]}
        >
          {FEATURE_PILLS.map((text, i) => (
            <View key={text} style={styles.pill}>
              {i === 0 && <Ionicons name="scan" size={12} color="rgba(255,255,255,0.8)" style={{ marginRight: 4 }} />}
              {i === 2 && <Ionicons name="pulse" size={12} color="rgba(255,255,255,0.8)" style={{ marginRight: 4 }} />}
              <Text style={styles.pillText}>{text}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Progress bar */}
        <Animated.View style={[styles.progressContainer, { opacity: progressOpacity }]}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <View style={styles.progressLabel}>
            {(holdOpen || phase < 4) ? (
              <>
                <ActivityIndicator size={10} color="rgba(255,255,255,0.5)" />
                <Text style={styles.progressText}>
                  {holdOpen ? 'Preparing your session…' : 'Initializing clinic…'}
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={12} color="#4ade80" />
                <Text style={[styles.progressText, { color: '#4ade80' }]}>Ready!</Text>
              </>
            )}
          </View>
        </Animated.View>

        {/* Version tag */}
        <Animated.Text style={[styles.versionText, { opacity: versionOpacity }]}>
          v1.0 • AI-Powered Fruit Quality Detection
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Gradient background ── */
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#15803d', // primary-700
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
  },
  orb1: {
    width: 280,
    height: 280,
    top: '8%',
    left: '10%',
    backgroundColor: 'rgba(251,191,36,0.12)', // accent glow
  },
  orb2: {
    width: 340,
    height: 340,
    bottom: '10%',
    right: '5%',
    backgroundColor: 'rgba(16,185,129,0.10)', // emerald glow
  },
  orb3: {
    width: 220,
    height: 220,
    top: '45%',
    left: '55%',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  dotGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.04,
  },
  bgFruit: {
    position: 'absolute',
  },

  /* ── Content ── */
  content: {
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 24,
  },

  /* ── Logo ── */
  logoContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  logoBox: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  pulseRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  fruitEmoji: {
    position: 'absolute',
    fontSize: 22,
  },

  /* ── Brand ── */
  brandContainer: {
    alignItems: 'center',
    marginTop: 28,
  },
  brandText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  brandAccent: {
    color: '#fbbf24', // accent gold
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  heartEmoji: {
    fontSize: 12,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
    letterSpacing: 1,
  },

  /* ── Pills ── */
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 28,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
  },

  /* ── Progress ── */
  progressContainer: {
    alignItems: 'center',
    marginTop: 36,
    gap: 10,
  },
  progressTrack: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#fbbf24', // accent gold bar
  },
  progressLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },

  /* ── Version ── */
  versionText: {
    marginTop: 32,
    fontSize: 9,
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
