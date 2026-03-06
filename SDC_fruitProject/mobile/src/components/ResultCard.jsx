import { LabelBadge, GradeBadge } from './Badges';
import { fruitEmoji, FRUIT_HEALTH_INFO, getRandomFacts } from '../utils/fruitConstants';
import { useState } from 'react';
import { useI18n } from '../contexts/I18nContext';

export default function ResultCard({ result, showImage = true }) {
  if (!result) return null;
  const { t, fruitName, labelName } = useI18n();

  const fruit = result.fruit_type || 'apple';
  const info = FRUIT_HEALTH_INFO[fruit] || FRUIT_HEALTH_INFO.apple;
  const isFresh = result.predicted_label === 'Fresh';
  const [facts] = useState(() => getRandomFacts(fruit, 3));

  return (
    <div className="card animate-slide-up space-y-4">
      {showImage && result.image_url && (
        <div className="relative overflow-hidden rounded-xl aspect-square bg-gray-50 dark:bg-gray-800">
          <img src={result.image_url} alt="Detection" className="object-cover w-full h-full" />
          <div className={`absolute top-2 right-2 px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg ${
            isFresh ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          } animate-bounce-in`}>
            {isFresh ? '✅ ' : '❌ '}{labelName(result.predicted_label)}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {result.fruit_type && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('result.patient')}</span>
            <span className="text-base font-semibold capitalize flex items-center gap-1.5">
              {fruitEmoji(result.fruit_type)} {fruitName(result.fruit_type)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('result.diagnosis')}</span>
          <LabelBadge label={result.predicted_label} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('result.confidence')}</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${isFresh ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${(result.confidence * 100).toFixed(0)}%` }} />
            </div>
            <span className="text-sm font-bold tabular-nums">{(result.confidence * 100).toFixed(1)}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('result.grade')}</span>
          <GradeBadge grade={result.grade} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('result.time')}</span>
          <span className="text-sm font-semibold tabular-nums">{result.processing_time}s</span>
        </div>
      </div>

      {/* Health tip */}
      <div className={`rounded-xl p-3 space-y-1 ${
        isFresh
          ? 'bg-green-50 dark:bg-green-900/15 border border-green-200/60 dark:border-green-800/30'
          : 'bg-red-50 dark:bg-red-900/15 border border-red-200/60 dark:border-red-800/30'
      }`}>
        <p className={`text-sm font-bold ${isFresh ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
          {isFresh ? '🩺 ' + t('detect.freshLabel') : '⚠️ ' + t('detect.rottenLabel')}
        </p>
        <p className={`text-sm leading-relaxed ${isFresh ? 'text-green-600/80 dark:text-green-400/70' : 'text-red-600/80 dark:text-red-400/70'}`}>
          {isFresh ? info.freshTip : info.rottenSign}
        </p>
      </div>

      {/* Fun facts */}
      <div className="rounded-xl p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/30">
        <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-2">💡 {t('detect.didYouKnow')}</p>
        <div className="space-y-1.5">
          {facts.map((fact, i) => (
            <div key={i} className="text-sm text-amber-600/80 dark:text-amber-400/70 leading-relaxed flex items-start gap-2">
              <span className="flex-shrink-0 mt-0.5">{fruitEmoji(fruit)}</span>
              <div>
                <span>{typeof fact === 'string' ? fact : fact.text}</span>
                {fact.source && (
                  <span className="block text-xs text-amber-500/50 dark:text-amber-500/40 italic mt-0.5">— {fact.source}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
