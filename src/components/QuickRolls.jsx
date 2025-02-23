import ToastManager from './ToastManager';
import { useSpellContext } from '../context/SpellContext';
import { getLinkStatBonus } from '../utils/diceHelpers';
import { capitalizeFirstLetter } from '../utils/commonUtils';

const QuickRolls = () => {
    const { showToast } = ToastManager();
    const { spells } = useSpellContext();

    const copyRollToClipboard = (rollType, stat) => {
        let roll = "[[1d20+" + getLinkStatBonus(spells, stat);
        if (rollType === 'Initiative') {
            roll += "&{tracker}";
        }
        roll += "]]";
        
        const command = `&{template:default} {{name=${rollType}}}\
        {{Roll=${roll}}}\
        {{Stat Bonus=[[${getLinkStatBonus(spells, stat)}]] from ${capitalizeFirstLetter(stat)}}}`;
        navigator.clipboard.writeText(command);
        showToast(rollType + " roll command copied! Paste it into the text chat on Roll20.", 'clipboard', 'success', 'Copied to clipboard');
    };

    const saveRolls = [
        { name: 'Fortitude Save', stat: 'vitality', icon: 'fa-shield-heart' },
        { name: 'Will Save', stat: 'spirit', icon: 'fa-brain' },
        { name: 'Reflex Save', stat: 'speed', icon: 'fa-person-running' },
    ];

    const initiativeRoll = { name: 'Initiative', stat: 'speed', icon: 'fa-bolt' };

    return (
        <div className="save-rolls p-3 rounded">
            <h5 className="text-secondary-emphasis mb-3">QUICK ROLLS</h5>
            <div className="d-flex flex-wrap gap-2 align-items-center justify-content-center">
                {saveRolls.map((roll) => (
                    <button
                        key={roll.name}
                        onClick={() => copyRollToClipboard(roll.name, roll.stat)}
                        className={`btn dark-btn d-flex align-items-center justify-content-center flex-grow-1 position-relative`}
                        style={{ minWidth: '140px', maxWidth: '170px', height: '48px' }}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title={`Roll ${roll.name}`}
                    >
                        <i className={`fas ${roll.icon} me-2`} style={{ width: '20px' }}></i>
                        <span className="text-light">{roll.name}</span>
                    </button>
                ))}
                <button
                    key={initiativeRoll.name}
                    onClick={() => copyRollToClipboard(initiativeRoll.name, initiativeRoll.stat)}
                    className={`btn dark-btn-primary d-flex align-items-center justify-content-center flex-grow-1 position-relative`}
                    style={{ minWidth: '140px', maxWidth: '170px', height: '48px' }}
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title={`Roll ${initiativeRoll.name}`}
                >
                    <i className={`fas ${initiativeRoll.icon} text-${initiativeRoll.color} me-2`} style={{ width: '20px' }}></i>
                    <span className="text-light">{initiativeRoll.name}</span>
                </button>
            </div>
        </div>
    );
};

export default QuickRolls;