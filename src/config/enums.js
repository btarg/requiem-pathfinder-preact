export const ElementType = Object.freeze({
    PHYS: "Physical",
    FIRE: "Fire",
    ICE: "Cold",
    ELEC: "Electricity",
    FORCE: "Force",
    PSY: "Psychic",
    CHEM: "Chemical",
    VIT: "Vitality",
    VOID: "Void"
});

export const getElementIcon = (element) => {
    switch (element) {
        case ElementType.CHEM:
            return '🧪';
        case ElementType.ICE:
            return '❄️';
        case ElementType.ELEC:
            return '⚡';
        case ElementType.FIRE:
            return '🔥';
        case ElementType.FORCE:
            return '💥';
        case ElementType.VIT:
            return '✨';
        case ElementType.VOID:
            return '🌌';
        case ElementType.PSY:
            return '🌀';
        default:
            return '⚔️';
    }

};
