import type { Pet } from './storage';
import { getAllPets, getLikes } from './storage';

// --- WEIGHTS ---
const WEIGHTS = {
    DISTANCE: 0.30,
    PREFERENCE: 0.40,
    FRESHNESS: 0.10,
    RANDOM: 0.20
};

// --- SCORING FUNCTIONS ---

const getDistanceScore = (distanceStr: string): number => {
    // Parse distance format "5m", "10 miles", etc.
    // Simplifying: assumes format like "5m" or "5 miles" or just number
    const dist = parseFloat(distanceStr);
    if (isNaN(dist)) return 50; // Default if unknown

    if (dist < 5) return 100;
    if (dist < 10) return 80;
    if (dist < 25) return 50;
    if (dist < 50) return 30;
    return 10;
};

const getFreshnessScore = (id: number): number => {
    // Assumes ID is timestamp for user pets, or fixed small ID for mock pets
    // Mock pets are "old" (low ID), user pets are "new" (high timestamp)
    const now = Date.now();
    const ageMs = now - id;

    // If ID is small (mock pet), treat as neutral
    if (id < 100000) return 50;

    // Newer pets get higher score
    const oneDay = 24 * 60 * 60 * 1000;
    if (ageMs < oneDay) return 100;
    if (ageMs < oneDay * 7) return 80;
    return 40;
};

const getUserPreferenceProfile = (userId: string) => {
    const likes = getLikes(userId);
    const allPets = getAllPets();
    const likedPets = allPets.filter(p => likes.includes(p.id));

    if (likedPets.length === 0) return null;

    // Count frequencies
    const typeCounts: Record<string, number> = {};
    const breedCounts: Record<string, number> = {};

    likedPets.forEach(p => {
        typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
        breedCounts[p.breed] = (breedCounts[p.breed] || 0) + 1;
    });

    // Normalize
    const totalLikes = likedPets.length;
    return {
        types: typeCounts,
        breeds: breedCounts,
        total: totalLikes
    };
};

const getPreferenceScore = (pet: Pet, profile: any): number => {
    if (!profile) return 0; // Cold start

    // Type Score (Base compatibility)
    const typeWeight = profile.types[pet.type] || 0;
    const typeScore = (typeWeight / profile.total) * 60; // Up to 60 pts for type match

    // Breed Score (Specific preference)
    const breedWeight = profile.breeds[pet.breed] || 0;
    const breedScore = (breedWeight / profile.total) * 40; // Up to 40 pts for breed match

    return Math.min(100, typeScore + breedScore);
};

// --- MAIN ALGORITHM ---

export const getRecommendedPets = (userId: string): Pet[] => {
    const allPets = getAllPets();

    if (!userId) {
        // Not logged in: Random shuffle or simple reverse chronological
        return [...allPets].sort(() => Math.random() - 0.5);
    }

    // likes const was unused, removed it
    const profile = getUserPreferenceProfile(userId);

    // Filter out pets user already interactive with?
    // For a feed, we usually hide rejected, but might show Liked again?
    // Let's Keep them all but maybe deprioritize Liked ones if we wanted match logic.
    // For this simple feed, we just score everything.

    const scoredPets = allPets.map(pet => {
        // 1. Distance Score (0-100)
        const distScore = getDistanceScore(pet.distance);

        // 2. Preference Score (0-100)
        const prefScore = getPreferenceScore(pet, profile);

        // 3. Freshness Score (0-100)
        const freshScore = getFreshnessScore(pet.id);

        // 4. Random Score (0-100)
        const randScore = Math.random() * 100;

        // Calculate Weighted Total
        const totalScore =
            (distScore * WEIGHTS.DISTANCE) +
            (prefScore * WEIGHTS.PREFERENCE) +
            (freshScore * WEIGHTS.FRESHNESS) +
            (randScore * WEIGHTS.RANDOM);

        return { ...pet, _score: totalScore };
    });

    // Sort by Score DESC
    scoredPets.sort((a, b) => b._score - a._score);

    // Return pets (strip internal score if needed, but JS objects are flexible)
    return scoredPets;
};
