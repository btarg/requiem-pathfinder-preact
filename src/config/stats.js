import { STAT_CATEGORIES, STAT_TYPES } from '../types/statTypes';

export const STATS_CONFIG = {
    strength: {
        name: "Strength",
        icon: "fa-fist-raised",
        description: "Increases physical attack damage unless resisted/absorbed/immune. Applied as flat bonus to Physical damage rolls.",
        category: STAT_CATEGORIES.PHYSICAL,
        type: STAT_TYPES.OFFENSIVE,
        defaultValue: 0,
        displayModifier: true,
        affectsRolls: true,
        damageType: 'physical'
    },
    vitality: {
        name: "Vitality",
        icon: "fa-shield-alt",
        description: "Reduces incoming Physical damage when attack is resisted. Does not affect neutral or absorbed damage.",
        category: STAT_CATEGORIES.PHYSICAL,
        type: STAT_TYPES.DEFENSIVE,
        defaultValue: 0,
        displayModifier: true,
        damageReduction: true,
        damageType: 'physical'
    },
    magic: {
        name: "Magic",
        icon: "fa-hand-sparkles",
        description: "Increases magical attack damage unless resisted/absorbed/immune. Applied as flat bonus.",
        category: STAT_CATEGORIES.MAGICAL,
        type: STAT_TYPES.OFFENSIVE,
        defaultValue: 0,
        displayModifier: true,
        affectsRolls: true,
        damageType: 'magical'
    },
    spirit: {
        name: "Spirit",
        icon: "fa-shield-heart",
        description: "Reduces incoming magical damage when attack is resisted. Does not affect neutral or absorbed damage.",
        category: STAT_CATEGORIES.MAGICAL,
        type: STAT_TYPES.DEFENSIVE,
        defaultValue: 0,
        displayModifier: true,
        damageReduction: true,
        damageType: 'magical'
    },
    speed: {
        name: "Speed",
        icon: "fa-running",
        description: "Bonus to Initiative and movement distance per turn",
        category: STAT_CATEGORIES.UTILITY,
        type: STAT_TYPES.UTILITY,
        defaultValue: 0,
        displayModifier: true,
        derived: {
            initiative: (value) => value,
            movement: (value) => value
        }
    },
    luck: {
        name: "Luck",
        icon: "fa-dice",
        description: "Affects spell draws and knockdown resistance",
        category: STAT_CATEGORIES.UTILITY,
        type: STAT_TYPES.UTILITY,
        defaultValue: 0,
        displayModifier: true,
        derived: {
            maxExtraDrawDice: (value) => Math.min(Math.floor(value), 4),
            knockdownBonus: (value) => value // Flat bonus to Fortitude saves
        }
    }
};

// Add calculations for Soul Link bonuses
export const calculateSoulLinkBonus = (spellStock, spellRank) => {
    return Math.floor((spellStock * spellRank) / 5);
};

export const SPELL_RANKS = {
    CANTRIP_AND_FIRST: 1,  // Cantrips & Level 1
    SECOND_AND_THIRD: 2,   // Levels 2-3
    FOURTH_AND_FIFTH: 3,   // Levels 4-5
    SIXTH_AND_SEVENTH: 4,  // Levels 6-7
    EIGHTH_TO_TENTH: 5     // Levels 8-10
};

export const getSpellRank = (spellLevel) => {
    if (spellLevel <= 1) return SPELL_RANKS.CANTRIP_AND_FIRST;
    if (spellLevel <= 3) return SPELL_RANKS.SECOND_AND_THIRD;
    if (spellLevel <= 5) return SPELL_RANKS.FOURTH_AND_FIFTH;
    if (spellLevel <= 7) return SPELL_RANKS.SIXTH_AND_SEVENTH;
    return SPELL_RANKS.EIGHTH_TO_TENTH;
};