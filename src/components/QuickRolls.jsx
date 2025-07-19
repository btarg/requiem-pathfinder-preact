import ToastManager from './ToastManager';
import { useSpellContext } from '../context/SpellContext';
import { getLinkStatBonus } from '../utils/diceHelpers';
import { capitalizeFirstLetter } from '../utils/commonUtils';
import { STATS_CONFIG } from '../config/stats';
import { calculateConditionEffects } from '../config/conditions';
import { useContext } from 'preact/hooks';
import { CharacterContext } from '../context/CharacterContext';

const QuickRolls = () => {
    const { showToast } = ToastManager();
    const { spells } = useSpellContext();
    const { characterStats } = useContext(CharacterContext);

    const getPlayerConditionsModifier = (rollType) => {
        const effects = calculateConditionEffects(characterStats.conditions);
        return effects.saveModifier || 0;
    }

    const copyRollToClipboard = (rollType, stat) => {
        const statBonus = getLinkStatBonus(spells, stat);
        const conditionModifier = getPlayerConditionsModifier(rollType);
        const totalModifier = statBonus + conditionModifier;
        
        let roll = "[[1d20+" + totalModifier;
        if (rollType === 'Initiative') {
            roll += "&{tracker}";
        }
        roll += "]]";
        roll = roll.replace("+-", "-"); // Fix any double negatives

        const command = `&{template:default} {{name=${rollType}}}\{{Roll=${roll}}}\{{Stat Bonus=[[${statBonus}]] from ${capitalizeFirstLetter(stat)}}}\{{Condition Modifier=[[${conditionModifier}]]}}`;

        navigator.clipboard.writeText(command);
        showToast(rollType + " roll command copied! Paste it into the text chat on Roll20.", 'clipboard', 'success', 'Copied to clipboard');
    };

    const saveRolls = [
        { name: 'Fortitude Save', stat: 'vitality' },
        { name: 'Will Save', stat: 'spirit' },
        { name: 'Reflex Save', stat: 'speed' },
    ];

    const initiativeRoll = { name: 'Initiative', stat: 'speed', icon: 'fa-bolt' };

    return (
        <div className="save-rolls">

            <div className="d-flex flex-wrap gap-2 align-items-center justify-content-center">
                {saveRolls.map((roll) => (
                    <button
                        key={roll.name}
                        onClick={() => copyRollToClipboard(roll.name, roll.stat)}
                        className={`dark-btn dark-btn-secondary d-flex align-items-center justify-content-center flex-grow-1 position-relative`}
                        style={{ minWidth: '140px', maxWidth: '170px', height: '48px' }}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title={`Roll ${roll.name} (${STATS_CONFIG[roll.stat].shortName})`}
                    >
                        <i className={`fas ${STATS_CONFIG[roll.stat].icon} me-2`} style={{ width: '20px' }}></i>
                        <span>{roll.name}</span>
                    </button>
                ))}
                <button
                    key={initiativeRoll.name}
                    onClick={() => copyRollToClipboard(initiativeRoll.name, initiativeRoll.stat)}
                    className={`dark-btn dark-btn-primary d-flex align-items-center justify-content-center flex-grow-1 position-relative`}
                    style={{ minWidth: '140px', maxWidth: '170px', height: '48px' }}
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title={`Roll ${initiativeRoll.name} (${STATS_CONFIG[initiativeRoll.stat].shortName})`}
                >
                    <i className={`fas ${initiativeRoll.icon} text-${initiativeRoll.color} me-2`} style={{ width: '20px' }}></i>
                    <span>{initiativeRoll.name}</span>
                </button>


            </div>

        </div>
    );
};

export default QuickRolls;