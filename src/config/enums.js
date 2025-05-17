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
    ALMIGHTY: "Almighty",
});

export const getElementIcon = (element) => {
    switch (element) {
        case ElementType.PHYS:
            return '⚔️';
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
        case ElementType.RAD:
            return '✨';
        case ElementType.VOID:
            return '🌌';
        case ElementType.PSY:
            return '🌀';
        default:
            return '☄️';
    }

};
