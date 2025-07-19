export const CONDITIONS_CONFIG = {
    'Blinded': { 
        maxStack: 1,
        effects: { ac: -2 }
    },
    'Broken': { maxStack: 1 },
    'Clumsy': { 
        maxStack: 4,
        effects: { ac: -1 } // -1 AC per stack (affects Dex-based AC)
    },
    'Concealed': { maxStack: 1 },
    'Confused': { maxStack: 1 },
    'Controlled': { maxStack: 1 },
    'Dazzled': { maxStack: 1 },
    'Deafened': { maxStack: 1 },
    'Doomed': { maxStack: 3 },
    'Drained': { maxStack: 4 },
    'Dying': { maxStack: 4 },
    'Encumbered': { 
        maxStack: 1,
        effects: { speed: -10 }
    },
    'Enfeebled': { maxStack: 4 },
    'Fascinated': { maxStack: 1 },
    'Fatigued': { 
        maxStack: 1,
        effects: { ac: -1, speed: -10 }
    },
    'Flat-Footed': { 
        maxStack: 1,
        effects: { ac: -2 }
    },
    'Fleeing': { maxStack: 1 },
    'Frightened': { 
        maxStack: 4,
        effects: { ac: -1 } // -1 AC per stack
    },
    'Grabbed': { 
        maxStack: 1,
        effects: { ac: -2 }
    },
    'Hidden': { maxStack: 1 },
    'Immobilized': { 
        maxStack: 1,
        effects: { ac: -2, speed: 0 } // Speed becomes 0
    },
    'Invisible': { maxStack: 1 },
    'Observed': { maxStack: 1 },
    'Off-Guard': { 
        maxStack: 1,
        effects: { ac: -2 }
    },
    'Paralyzed': { 
        maxStack: 1,
        effects: { ac: -4, speed: 0 } // Speed becomes 0
    },
    'Persistent Damage': { maxStack: 1 },
    'Petrified': { 
        maxStack: 1,
        effects: { ac: -4, speed: 0 } // Speed becomes 0
    },
    'Prone': { 
        maxStack: 1,
        effects: { ac: -2 }
    },
    'Quickened': { maxStack: 1 },
    'Restrained': { 
        maxStack: 1,
        effects: { ac: -2, speed: 0 } // Speed becomes 0
    },
    'Sickened': { 
        maxStack: 4,
        effects: { ac: -1 } // -1 AC per stack
    },
    'Slowed': { maxStack: 3 },
    'Stunned': { 
        maxStack: 3,
        effects: { ac: -2 }
    },
    'Stupefied': { 
        maxStack: 4,
        effects: { ac: -1 } // -1 AC per stack (affects mental stats)
    },
    'Unconscious': { 
        maxStack: 1,
        effects: { ac: -4, speed: 0 } // Speed becomes 0
    },
    'Undetected': { maxStack: 1 },
    'Unnoticed': { maxStack: 1 },
    'Wounded': { maxStack: 3 }
};

// Helper function to calculate condition effects
export const calculateConditionEffects = (conditions) => {
    if (!conditions) return { acModifier: 0, speedModifier: 0, speedOverride: null };
    
    let acModifier = 0;
    let speedModifier = 0;
    let speedOverride = null;
    
    Object.entries(conditions).forEach(([conditionName, value]) => {
        if (value > 0 && CONDITIONS_CONFIG[conditionName]?.effects) {
            const effects = CONDITIONS_CONFIG[conditionName].effects;
            const stackValue = value || 1;
            
            // AC effects
            if (effects.ac) {
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
        }
    });
    
    return { acModifier, speedModifier, speedOverride };
};