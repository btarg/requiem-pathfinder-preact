export const CONDITIONS_CONFIG = {
    'Blinded': { 
        maxStack: 1,
        effects: { ac: -2 } // All checks involving sight, including Perception
    },
    'Broken': { maxStack: 1 }, // Equipment condition, no mechanical effect on character
    'Clumsy': { 
        maxStack: 4,
        effects: { 
            ac: -1, 
            statPenalties: { speed: -1 }, // -1 to Dex-based checks per stack
            savingThrowPenalties: { 'Reflex Save': -1 } // -1 to Reflex saves per stack
        }
    },
    'Concealed': { maxStack: 1 }, // Others have flat check when targeting you
    'Confused': { maxStack: 1 }, // Random actions, no direct stat penalties
    'Controlled': { maxStack: 1 }, // Actions chosen by controller
    'Dazzled': { maxStack: 1 }, // All sight-based Perception checks take -1 penalty
    'Deafened': { maxStack: 1 }, // Auditory Perception checks take -2 penalty, can't use auditory abilities
    'Doomed': { 
        maxStack: 3,
        effects: { savingThrow: -1 } // -1 to all saving throws per stack
    },
    'Drained': { 
        maxStack: 4,
        effects: { 
            statPenalties: { vitality: -1 }, // -1 to Constitution (Vitality)-based checks per stack
            savingThrowPenalties: { 'Fortitude Save': -1 } // -1 to Fortitude saves per stack
        }
    },
    'Dying': { maxStack: 4 }, // Recovery checks, no direct stat penalties when stable
    'Encumbered': { 
        maxStack: 1,
        effects: { 
            speed: -10, 
            ac: -1, 
            savingThrowPenalties: { 'Reflex Save': -1 } // -1 penalty to Dex-based saves
        }
    },
    'Enfeebled': { 
        maxStack: 4,
        effects: { 
            statPenalties: { strength: -1 } // -1 to Strength-based checks, attack rolls, damage rolls per stack
        }
    },
    'Fascinated': { maxStack: 1 }, // -2 to Perception and skill checks not related to fascination source
    'Fatigued': { 
        maxStack: 1,
        effects: { ac: -1, savingThrow: -1 } // -1 AC and saving throws
    },
    'Flat-Footed': { 
        maxStack: 1,
        effects: { ac: -2 } // -2 AC
    },
    'Fleeing': { maxStack: 1 }, // Must spend actions to move away, no direct stat penalties
    'Frightened': { 
        maxStack: 4,
        effects: { ac: -1, savingThrow: -1 } // -1 to all checks and DCs per stack
    },
    'Grabbed': { 
        maxStack: 1,
        effects: { ac: -2 } // Flat-footed, can't move
    },
    'Hidden': { maxStack: 1 }, // Others must succeed at flat check to target you
    'Immobilized': { 
        maxStack: 1,
        effects: { speed: 0 } // Can't move, no AC penalty in PF2e
    },
    'Invisible': { maxStack: 1 }, // Undetected to all creatures relying on sight
    'Observed': { maxStack: 1 }, // Default state, no penalties
    'Off-Guard': { 
        maxStack: 1,
        effects: { ac: -2 } // Same as flat-footed, -2 AC
    },
    'Paralyzed': { 
        maxStack: 1,
        effects: { 
            ac: -2, 
            speed: 0, 
            savingThrowPenalties: { 'Reflex Save': -2 } // -2 to Reflex saves
        }
    },
    'Persistent Damage': { maxStack: 1 }, // Damage at end of turn, no direct stat penalties
    'Petrified': { 
        maxStack: 1,
        effects: { ac: 0, speed: 0} // Can't act, unconscious, but object AC replaces normal AC
    },
    'Prone': { 
        maxStack: 1,
        effects: { ac: -2 } // -2 AC against melee attacks, +2 AC against ranged (simplified to -2)
    },
    'Quickened': { maxStack: 1 }, // Gain extra action with restrictions, no penalties
    'Restrained': { 
        maxStack: 1,
        effects: { 
            ac: -2, 
            speed: 0, 
            savingThrowPenalties: { 'Reflex Save': -2 } // -2 to attack rolls and Reflex saves
        }
    },
    'Sickened': { 
        maxStack: 4,
        effects: { ac: -1, savingThrow: -1 } // -1 to all checks and DCs per stack
    },
    'Slowed': { maxStack: 3 }, // Lose actions, no direct stat penalties
    'Stunned': { 
        maxStack: 4, // Changed from 3 to 4 to match PF2e
        effects: { } // Lose actions and can't act, but no AC penalty in PF2e when just stunned
    },
    'Stupefied': { 
        maxStack: 4,
        effects: { 
            statPenalties: { intelligence: -1, wisdom: -1, charisma: -1 } // -1 to Int, Wis, Cha checks and DCs per stack
        }
    },
    'Unconscious': { 
        maxStack: 1,
        effects: { 
            ac: -4, 
            speed: 0, 
            savingThrowPenalties: { 'Reflex Save': -4 } // -4 to Reflex saves
        }
    },
    'Undetected': { maxStack: 1 }, // Others don't know your location
    'Unnoticed': { maxStack: 1 }, // Others don't know you exist
    'Wounded': { maxStack: 3 } // Increases dying condition when you go down
};

// Helper function to calculate condition effects
export const calculateConditionEffects = (conditions) => {
    if (!conditions) return { 
        acModifier: 0, 
        speedModifier: 0, 
        speedOverride: null, 
        savingThrowModifier: 0,
        statPenalties: {},
        savingThrowPenalties: {}
    };
    
    let acModifier = 0;
    let speedModifier = 0;
    let speedOverride = null;
    let savingThrowModifier = 0; // General saving throw modifier (for backwards compatibility)
    let statPenalties = {};
    let savingThrowPenalties = {};
    
    Object.entries(conditions).forEach(([conditionName, value]) => {
        if (value > 0 && CONDITIONS_CONFIG[conditionName]?.effects) {
            const effects = CONDITIONS_CONFIG[conditionName].effects;
            const stackValue = value || 1;
            
            // AC effects
            if (effects.ac !== undefined) {
                acModifier += effects.ac * stackValue;
            }
            
            // Speed effects
            if (effects.speed !== undefined) {
                if (effects.speed === 0) {
                    speedOverride = 0; // Conditions that set speed to 0
                } else {
                    speedModifier += effects.speed * stackValue;
                }
            }

            // General saving throw modifiers (backwards compatibility)
            if (effects.savingThrow !== undefined) {
                savingThrowModifier += effects.savingThrow * stackValue;
            }

            // Stat-specific penalties
            if (effects.statPenalties) {
                Object.entries(effects.statPenalties).forEach(([stat, penalty]) => {
                    if (!statPenalties[stat]) {
                        statPenalties[stat] = 0;
                    }
                    statPenalties[stat] += penalty * stackValue;
                });
            }

            // Saving throw-specific penalties
            if (effects.savingThrowPenalties) {
                Object.entries(effects.savingThrowPenalties).forEach(([saveType, penalty]) => {
                    if (!savingThrowPenalties[saveType]) {
                        savingThrowPenalties[saveType] = 0;
                    }
                    savingThrowPenalties[saveType] += penalty * stackValue;
                });
            }
        }
    });
    
    return { 
        acModifier, 
        speedModifier, 
        speedOverride, 
        savingThrowModifier,
        statPenalties,
        savingThrowPenalties
    };
};

// Helper function to get condition modifiers for a specific stat
export const getStatConditionModifier = (conditions, stat) => {
    if (!conditions) return 0;
    
    const effects = calculateConditionEffects(conditions);
    return effects.statPenalties[stat] || 0;
};

// Helper function to get condition modifiers for a specific saving throw
export const getSavingThrowConditionModifier = (conditions, saveType) => {
    if (!conditions) return 0;
    
    const effects = calculateConditionEffects(conditions);
    // Return specific saving throw penalty plus general saving throw modifier
    return (effects.savingThrowPenalties[saveType] || 0) + effects.savingThrowModifier;
};

// Helper function to calculate HP reduction from Drained condition
export const getDrainedHPReduction = (conditions, characterLevel = 1) => {
    if (!conditions || !conditions['Drained']) return 0;
    
    const drainedValue = conditions['Drained'] || 0;
    return drainedValue * Math.max(1, characterLevel);
};