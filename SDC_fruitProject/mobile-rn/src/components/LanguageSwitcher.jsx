import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import { useColors, Spacing, FontSize, BorderRadius } from '../theme';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'fil', label: 'Filipino', flag: '🇵🇭' },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const { dark } = useTheme();
  const c = useColors(dark);
  const [visible, setVisible] = useState(false);

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setVisible(true)}>
        <Text style={{ fontSize: 16 }}>{current.flag}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={[styles.sheet, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
            {LANGUAGES.map((l) => (
              <TouchableOpacity
                key={l.code}
                style={[
                  styles.option,
                  {
                    backgroundColor:
                      lang === l.code ? (dark ? 'rgba(22,163,74,0.15)' : 'rgba(22,163,74,0.08)') : 'transparent',
                  },
                ]}
                onPress={() => { setLang(l.code); setVisible(false); }}
              >
                <Text style={{ fontSize: 20 }}>{l.flag}</Text>
                <Text style={[styles.optionLabel, { color: c.text }]}>{l.label}</Text>
                {lang === l.code && <Ionicons name="checkmark-circle" size={20} color={c.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { padding: 6 },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  sheet: {
    width: '80%', maxWidth: 320,
    borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, gap: 4,
  },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, borderRadius: BorderRadius.md,
  },
  optionLabel: { flex: 1, fontSize: FontSize.md, fontWeight: '500' },
});
