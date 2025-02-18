import { useContext } from 'preact/hooks';
import { CharacterContext } from '../context/CharacterContext';
import { replaceDiceStats } from '../utils/diceHelpers';

const QuickRolls = () => {
    const { characterStats } = useContext(CharacterContext);

    const copyRollToClipboard = (rollType, stat) => {
        const roll = replaceDiceStats(`1d20+[${stat}]`, characterStats);
        const command = `&{template:default} {{name=${rollType}}} {{Roll=[[${roll}]]}}`;
        navigator.clipboard.writeText(command);
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
            <div className="d-flex flex-wrap gap-2">
                {saveRolls.map((roll) => (
                    <button
                        key={roll.name}
                        onClick={() => copyRollToClipboard(roll.name, roll.stat)}
                        className={`btn dark-btn d-flex align-items-center justify-content-center flex-grow-1 position-relative`}
                        style={{ minWidth: '140px', height: '48px' }}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title={`Roll ${roll.name.toLowerCase()} (1d20 + ${characterStats[roll.stat] || 0})`}
                    >
                        <i className={`fas ${roll.icon} me-2`} style={{ width: '20px' }}></i>
                        <span className="text-light">{roll.name}</span>
                    </button>
                ))}
                <button
                    key={initiativeRoll.name}
                    onClick={() => copyRollToClipboard(initiativeRoll.name, initiativeRoll.stat)}
                    className={`btn dark-btn-primary d-flex align-items-center justify-content-center flex-grow-1 position-relative`}
                    style={{ minWidth: '140px', height: '48px' }}
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title={`Roll ${initiativeRoll.name.toLowerCase()} (1d20 + ${characterStats[initiativeRoll.stat] || 0})`}
                >
                    <i className={`fas ${initiativeRoll.icon} text-${initiativeRoll.color} me-2`} style={{ width: '20px' }}></i>
                    <span className="text-light">{initiativeRoll.name}</span>
                </button>
            </div>
        </div>
    );
};

export default QuickRolls;