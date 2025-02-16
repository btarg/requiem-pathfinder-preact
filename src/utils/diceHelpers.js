import { DiceRoller } from "dice-roller-parser";

export const getFriendlyStatName = (stat) => {
    return stat
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
};

const calculateStatBonus = (stock, spellRank) => {
    return Math.floor((spellRank * 2) * Math.sqrt(stock / 2));
};

export const rollDrawDice = (luck, hasMastery) => {
    const baseDice = hasMastery ? "2d6" : "1d6";
    const maxExtraDice = Math.min(Math.floor(luck), 4);
    const extraDice = maxExtraDice > 0 ? `+${maxExtraDice}d4` : '';

    const roller = new DiceRoller();
    const result = roller.roll(`${baseDice}${extraDice}`);
    return result.value;
};

export const replaceDiceStats = (diceString, stats) => {
    return diceString.replace(/\[(\w+)\]/g, (match, stat) => {
        const value = stats[stat];
        if (value === undefined) {
            throw new Error(`Unknown stat: ${stat}`);
        }
        const hasLeadingPlus = diceString.indexOf(match) > 0 &&
            diceString[diceString.indexOf(match) - 1] === '+';
        return value >= 0 && !hasLeadingPlus ? `+${value}` : value.toString();
    });
};

export const getFriendlyDiceString = (diceString) => {
    return diceString.replace(/\[(\w+)\]/g, (match, stat) =>
        `(${getFriendlyStatName(stat)})`
    );
}

export const validateSpellFields = (spell) => {
    const errors = [];
    if (!spell.name) errors.push("Spell name is required");
    if (spell.quantity <= 0) errors.push("Quantity must be greater than 0");
    if (spell.quantity > 100) errors.push("Quantity must be 100 max");
    if (spell.power <= 0) errors.push("Spell level must be greater than 0");
    if (!spell.dice) errors.push("Damage roll is required");
    return errors;
};

export const validateDiceRoll = (diceString, characterStats) => {
    if (!diceString) {
        return { isValid: false, error: "A valid dice roll is required." };
    }

    try {
        const testString = diceString.replace(/\[\w+\]/g, "0");
        new DiceRoller().roll(testString);
        
        const statMatches = diceString.match(/\[(\w+)\]/g) || [];
        const unknownStats = statMatches
            .map(match => match.slice(1, -1))
            .filter(stat => characterStats[stat] === undefined);
            
        if (unknownStats.length > 0) {
            return { 
                isValid: false, 
                error: `Unknown stats: ${unknownStats.join(", ")}` 
            };
        }

        return { isValid: true, error: null };
    } catch (error) {
        return { 
            isValid: false, 
            error: "Invalid dice format. Use format like '1d6+[spellAttackModifier]' or '2d8+3'" 
        };
    }
};