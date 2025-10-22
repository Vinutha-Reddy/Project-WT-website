import { json } from '@sveltejs/kit';
import { readData } from '$lib/server/dataStore.js';

const CATEGORIES = [
  'mood',
  'energy',
  'stress',
  'productivity',
  'sleep',
  'social',
  'health',
  'motivation',
  'focus',
  'overall'
];

export async function GET({ url }) {
  const data = await readData();
  const responses = data.responses ?? [];
  const total = responses.length;

  if (total === 0) {
    return json({
      total: 0,
      exactMatches: 0,
      partialMatches: 0,
      exactSimilarity: 0,
      overallSimilarity: 0,
      stats: {},
      message: "Be the first to share how you're feeling!"
    });
  }

  const userResponse = Object.fromEntries(
    CATEGORIES.map((key) => [key, url.searchParams.get(key) ?? undefined])
  );

  let exactMatches = 0;
  let partialMatches = 0;

  responses.forEach((entry) => {
    let matchingCategories = 0;
    CATEGORIES.forEach((category) => {
      if (userResponse[category] && entry[category] === userResponse[category]) {
        matchingCategories += 1;
      }
    });

    if (matchingCategories === CATEGORIES.length) {
      exactMatches += 1;
    } else if (matchingCategories >= 7) {
      partialMatches += 1;
    }
  });

  const stats = {};
  CATEGORIES.forEach((category) => {
    const counts = {};
    responses.forEach((entry) => {
      const value = entry[category];
      if (!value) return;
      counts[value] = (counts[value] || 0) + 1;
    });

    const percentages = {};
    Object.entries(counts).forEach(([option, count]) => {
      percentages[option] = Math.round((count / total) * 100);
    });

    stats[category] = { counts, percentages };
  });

  const exactSimilarity = Math.round((exactMatches / total) * 100);
  const overallSimilarity = Math.round(((exactMatches + partialMatches) / total) * 100);

  const message = exactMatches > 0
    ? `${exactMatches} ${exactMatches === 1 ? 'person feels' : 'people feel'} exactly like you today!`
    : partialMatches > 0
      ? `${partialMatches} ${partialMatches === 1 ? 'person feels' : 'people feel'} very similar to you today!`
      : "You're unique today! No one feels exactly like you.";

  return json({
    total,
    exactMatches,
    partialMatches,
    exactSimilarity,
    overallSimilarity,
    stats,
    message
  });
}
