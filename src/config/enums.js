export const ElementType = Object.freeze({
    PHYS: "Physical",
    FIRE: "Fire",
    ICE: "Cold",
    ELEC: "Electricity",
    FORCE: "Force",
    PSY: "Psychic",
    CHEM: "Chemical",
    RAD: "Radiant",
    VOID: "Void",
    TRUE: "Almighty",
});

export const AffinityType = Object.freeze({
    WEAK: "Weak",
    NEUTRAL: "Neutral",
    RESIST: "Resist",
    IMMUNE: "Immune",
    ABSORB: "Drain",
    REFLECT: "Reflect",
});

const elementIcons = {
    [ElementType.PHYS]: '⚔️',
    [ElementType.CHEM]: '🧪',
    [ElementType.ICE]: '❄️',
    [ElementType.ELEC]: '⚡',
    [ElementType.FIRE]: '🔥',
    [ElementType.FORCE]: '💥',
    [ElementType.RAD]: '✨',
    [ElementType.VOID]: '🌌',
    [ElementType.PSY]: '🌀',
    // ElementType.TRUE will use the default
};

export const getElementIcon = (element) => {
    return elementIcons[element] || '☄️'; // Default icon
};

export const getElementShortName = (element) => {
    const shortNames = {
        [ElementType.PHYS]: 'Phys',
        [ElementType.CHEM]: 'Chem',
        [ElementType.ICE]: 'Ice',
        [ElementType.ELEC]: 'Elec',
        [ElementType.FIRE]: 'Fire',
        [ElementType.FORCE]: 'Force',
        [ElementType.RAD]: 'Rad',
        [ElementType.VOID]: 'Void',
        [ElementType.PSY]: 'Psy',
        [ElementType.TRUE]: '???'
    };
    
    return shortNames[element] || '???';
}

export const getAffinityShortName = (affinity) => {
    const shortNames = {
        [AffinityType.WEAK]: 'WK',
        [AffinityType.NEUTRAL]: '-',
        [AffinityType.RESIST]: 'RES',
        [AffinityType.IMMUNE]: 'NULL',
        [AffinityType.ABSORB]: 'DR',
        [AffinityType.REFLECT]: 'RFL'
    };
    
    return shortNames[affinity] || '???';
}