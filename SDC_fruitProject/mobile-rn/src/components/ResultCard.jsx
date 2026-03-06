import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LabelBadge, GradeBadge } from './Badges';
import { fruitEmoji, FRUIT_HEALTH_INFO, getRandomFacts, getConfidenceInsight } from '../utils/fruitConstants';
import { useState } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import { useColors, BorderRadius, FontSize, Spacing } from '../theme';

export default function ResultCard({ result, showImage = true }) {
  if (!result) return null;
  const { t, fruitName, labelName } = useI18n();
  const { dark } = useTheme();
  const c = useColors(dark);

  const fruit = result.fruit_type || 'apple';
  const info = FRUIT_HEALTH_INFO[fruit] || FRUIT_HEALTH_INFO.apple;
  const isFresh = result.predicted_label === 'Fresh';
  const [facts] = useState(() => getRandomFacts(fruit, 3));
  const confPct = (result.confidence * 100).toFixed(1);
  const insight = getConfidenceInsight(fruit, result.predicted_label, result.confidence);

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}>
      {/* Image */}
      {showImage && result.image_url ? (
        <View style={[styles.imageContainer, { backgroundColor: c.inputBg }]}>
          <Image source={{ uri: result.image_url }} style={styles.image} resizeMode="cover" />
          <View
            style={[
              styles.imageBadge,
              { backgroundColor: isFresh ? c.green : c.red },
            ]}
          >
            <Text style={styles.imageBadgeText}>
              {isFresh ? '✅ ' : '❌ '}
              {labelName(result.predicted_label)}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Details */}
      {result.fruit_type ? (
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: c.textSecondary }]}>{t('result.patient')}</Text>
          <Text style={[styles.rowValue, { color: c.text }]}>
            {fruitEmoji(result.fruit_type)} {fruitName(result.fruit_type)}
          </Text>
        </View>
      ) : null}

      <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: c.textSecondary }]}>{t('result.diagnosis')}</Text>
        <LabelBadge label={result.predicted_label} />
      </View>

      <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: c.textSecondary }]}>{t('result.confidence')}</Text>
        <View style={styles.confRow}>
          <View style={[styles.confBar, { backgroundColor: c.cardBorderSubtle }]}>
            <View
              style={[
                styles.confFill,
                {
                  backgroundColor: isFresh ? c.green : c.red,
                  width: `${confPct}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.confText, { color: c.text }]}>{confPct}%</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: c.textSecondary }]}>{t('result.grade')}</Text>
        <GradeBadge grade={result.grade} />
      </View>

      <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: c.textSecondary }]}>{t('result.time')}</Text>
        <Text style={[styles.rowValue, { color: c.text }]}>{result.processing_time}s</Text>
      </View>

      {/* Health tip */}
      <View
        style={[
          styles.tipBox,
          {
            backgroundColor: isFresh ? c.successBg : c.errorBg,
            borderColor: isFresh ? c.successBorder : c.errorBorder,
          },
        ]}
      >
        <Text
          style={[
            styles.tipTitle,
            { color: isFresh ? c.successText : c.errorText },
          ]}
        >
          {isFresh ? '🩺 ' + t('detect.freshLabel') : '⚠️ ' + t('detect.rottenLabel')}
        </Text>
        <Text
          style={[
            styles.tipText,
            { color: isFresh ? c.successText : c.errorText, opacity: 0.8 },
          ]}
        >
          {isFresh ? info.freshTip : info.rottenSign}
        </Text>
      </View>

      {/* AI Insight */}
      {insight && (
        <View
          style={[
            styles.insightBox,
            {
              backgroundColor:
                insight.safetyLevel === 'safe'
                  ? c.successBg
                  : insight.safetyLevel === 'danger'
                  ? c.errorBg
                  : c.warningBg,
              borderColor:
                insight.safetyLevel === 'safe'
                  ? c.successBorder
                  : insight.safetyLevel === 'danger'
                  ? c.errorBorder
                  : c.warningBorder,
            },
          ]}
        >
          {/* Verdict */}
          <View style={styles.insightHeader}>
            <Text style={styles.insightIcon}>{insight.safetyIcon}</Text>
            <Text
              style={[
                styles.insightVerdict,
                {
                  color:
                    insight.safetyLevel === 'safe'
                      ? c.successText
                      : insight.safetyLevel === 'danger'
                      ? c.errorText
                      : c.warningText,
                },
              ]}
            >
              {insight.verdict}
            </Text>
          </View>

          {/* Advice */}
          <Text
            style={[
              styles.insightAdvice,
              {
                color:
                  insight.safetyLevel === 'safe'
                    ? c.successText
                    : insight.safetyLevel === 'danger'
                    ? c.errorText
                    : c.warningText,
                opacity: 0.85,
              },
            ]}
          >
            {insight.advice}
          </Text>

          {/* Nutrition */}
          {insight.nutritionTip ? (
            <View style={[styles.insightInfoRow, { borderTopColor: insight.safetyLevel === 'safe' ? c.successBorder : insight.safetyLevel === 'danger' ? c.errorBorder : c.warningBorder }]}>
              <Text style={styles.insightInfoIcon}>🥗</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.insightInfoLabel, { color: c.textSecondary }]}>Nutrition Tip</Text>
                <Text style={[styles.insightInfoText, { color: c.text }]}>{insight.nutritionTip}</Text>
              </View>
            </View>
          ) : null}

          {/* Storage */}
          {insight.storageTip ? (
            <View style={[styles.insightInfoRow, { borderTopColor: insight.safetyLevel === 'safe' ? c.successBorder : insight.safetyLevel === 'danger' ? c.errorBorder : c.warningBorder }]}>
              <Text style={styles.insightInfoIcon}>📦</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.insightInfoLabel, { color: c.textSecondary }]}>Storage Tip</Text>
                <Text style={[styles.insightInfoText, { color: c.text }]}>{insight.storageTip}</Text>
              </View>
            </View>
          ) : null}
        </View>
      )}

      {/* Fun facts */}
      <View style={[styles.factBox, { backgroundColor: c.warningBg, borderColor: c.warningBorder }]}>
        <Text style={[styles.factTitle, { color: c.amber }]}>
          💡 {t('detect.didYouKnow')}
        </Text>
        {facts.map((fact, i) => (
          <View key={i} style={styles.factRow}>
            <Text style={styles.factEmoji}>{fruitEmoji(fruit)}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.factText, { color: c.warningText }]}>
                {typeof fact === 'string' ? fact : fact.text}
              </Text>
              {fact.source ? (
                <Text style={[styles.factSource, { color: c.warningText, opacity: 0.6 }]}>
                  — {fact.source}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  imageContainer: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  imageBadgeText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: FontSize.md,
  },
  rowValue: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  confRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  confBar: {
    width: 80,
    height: 10,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  confFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  confText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  tipBox: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    gap: 4,
  },
  tipTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  tipText: {
    fontSize: FontSize.md,
    lineHeight: 20,
  },
  factBox: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  factTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  factRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  factEmoji: {
    fontSize: FontSize.md,
    marginTop: 2,
  },
  factText: {
    fontSize: FontSize.md,
    lineHeight: 20,
  },
  factSource: {
    fontSize: FontSize.xs,
    fontStyle: 'italic',
    marginTop: 2,
  },
  /* ── AI Insight ────────────────── */
  insightBox: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  insightIcon: {
    fontSize: FontSize.xl,
  },
  insightVerdict: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    flex: 1,
  },
  insightAdvice: {
    fontSize: FontSize.md,
    lineHeight: 20,
  },
  insightInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
  },
  insightInfoIcon: {
    fontSize: FontSize.lg,
    marginTop: 2,
  },
  insightInfoLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightInfoText: {
    fontSize: FontSize.md,
    lineHeight: 20,
    marginTop: 2,
  },
});
