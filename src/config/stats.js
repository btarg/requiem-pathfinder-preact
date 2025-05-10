import { STAT_CATEGORIES, STAT_TYPES } from '../types/statTypes';

export const STATS_CONFIG = {
    currentHealth: {
        defaultValue: 10,
        label: 'Current HP',
        type: STAT_TYPES.CORE
    },
    maxHealth: {
        defaultValue: 10,
        label: 'Max HP',
        type: STAT_TYPES.CORE
    },
    tempHealth: {
        defaultValue: 0,
        label: 'Temporary HP',
        type: STAT_TYPES.CORE
    },
    strength: {
        name: "Strength",
        shortName: "STR",
        icon: "fa-fist-raised",
        color: "danger",
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
        shortName: "VIT",
        icon: "fa-shield-alt",
        color: "primary-emphasis",
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
        shortName: "MAG",
        icon: "fa-hand-sparkles",
        color: "success-emphasis",
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
        shortName: "SPR",
        icon: "fa-shield-heart",
        color: "info",
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
        shortName: "SPD",
        icon: "fa-running",
        color: "secondary-emphasis",
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
        shortName: "LUCK",
        icon: "fa-clover",
        color: "success",
        description: "Affects spell draws and knockdown resistance",
        category: STAT_CATEGORIES.UTILITY,
        type: STAT_TYPES.UTILITY,
        defaultValue: 0,
        displayModifier: true,
        derived: {
            maxExtraDrawDice: (value) => Math.min(Math.floor(value), 4),
            knockdownBonus: (value) => value // Flat bonus to Fortitude saves
        }
    },
    influence: {
        name: "Influence",
        shortName: "INF",
        icon: "fa-comments",
        color: "warning",
        description: "Used for social rolls, such as Deception, Intimidation, Performance, Diplomacy and Persuasion.",
        category: STAT_CATEGORIES.UTILITY,
        type: STAT_TYPES.UTILITY,
        defaultValue: 0,
        displayModifier: true,
    },
    wisdom: {
        name: "Wisdom",
        shortName: "WIS",
        icon: "fa-book-open",
        color: "warning-emphasis",
        description: "Used for Recalling Knowledge of any kind: essentially every Pathfinder 2E lore skill rolled into one. Also useful in social situations.",
        category: STAT_CATEGORIES.UTILITY,
        type: STAT_TYPES.UTILITY,
        defaultValue: 0,
        displayModifier: true,
    },
};

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