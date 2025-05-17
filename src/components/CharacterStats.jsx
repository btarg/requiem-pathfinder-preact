import { useContext } from 'preact/hooks';
import { CharacterContext } from '../context/CharacterContext';
import { STATS_CONFIG } from '../config/stats';
import { STAT_CATEGORIES } from '../types/statTypes';
import { useSpellContext } from '../context/SpellContext';
import { getLinkStatBonus } from '../utils/diceHelpers';
import DecorativeTitle from './DecorativeTitle';
import ToastManager from './ToastManager';
import { capitalizeFirstLetter } from '../utils/commonUtils';
const CharacterStats = () => {
    const { characterStats, setCharacterStats } = useContext(CharacterContext);
    const { spells } = useSpellContext();

    const { showToast } = ToastManager();

    const updateStat = (statName, value) => {
        setCharacterStats(prev => ({
            ...prev,
            [statName]: parseInt(value, 10) || 0
        }));
    };

    const copyStatCheckRoll = (stat) => {
        // Ask the user to input a DC, where leaving it as zero will just do a normal roll
        const dc = prompt("Enter a DC for the roll (leave blank for normal roll):");
        const dcValue = parseInt(dc, 10) || 0;
        
        // Base roll calculation with the bonus
        const bonus = (characterStats[stat] || 0) + getLinkStatBonus(spells, stat);
        const statConfig = STATS_CONFIG[stat];
        
        // Build the roll command
        let roll = `1d20+${bonus}`;
        
        // Add success/failure tracking for Roll20 if DC is provided
        if (dcValue > 0) {
            roll = `${roll}cs>=${dcValue}cf<${dcValue}`;
        }
        
        const checkString = dcValue ? `check vs DC ${dcValue}` : 'check';
        const command = `&{template:default} {{name=${capitalizeFirstLetter(stat)} ${checkString}}}` +
                       `{{Roll=[[${roll}]]}}` +
                       `{{Stat Bonus=[[${bonus}]] from ${statConfig.shortName}}}`;
        
        // Copy to clipboard and show confirmation
        navigator.clipboard.writeText(command);
        
        const toastMessage = dcValue 
            ? `${statConfig.name} roll vs DC ${dcValue} copied! Paste it into Roll20.`
            : `${statConfig.name} roll command copied! Paste it into Roll20.`;
            
        showToast(toastMessage, 'clipboard', 'success', 'Copied to clipboard');
    };

    const renderStatGroup = (category) => {
        const statsInCategory = Object.entries(STATS_CONFIG)
            .filter(([_, config]) => config.category === category);

        return statsInCategory.length > 0 && (
            <div className="stat-category">
                <h6 className="stat-category-title text-secondary mb-3">
                    {category.toUpperCase()}
                </h6>
                <div className="stat-grid">
                    {statsInCategory.map(([statKey, config]) => (
                        <div
                            key={statKey}
                            className="stat-group mb-3"
                            title={`${config.name} ${config.description}`}
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                        >
                            <div className="input-group">

                                <span className={`input-group-text gap-1 text-${config.color}`}
                                    onClick={() => copyStatCheckRoll(statKey)}
                                    
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className={`fas ${config.icon}`}></i> <span className="stat-text">{config.shortName}</span>
                                </span>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={characterStats[statKey] || 0}
                                    onChange={(e) => updateStat(statKey, e.currentTarget.value)}
                                // style={{ borderColor: `var(--bs-${config.color})` }}
                                />
                                <span className="input-group-text"
                                // style={{ borderColor: `var(--bs-${config.color}) !important` }}
                                >
                                    <i className={`fas ${getLinkStatBonus(spells, statKey) ? '' : 'fa-link-slash'} text-muted`}></i>
                                    {getLinkStatBonus(spells, statKey) > 0 && (
                                        <div>
                                            <span className="text-secondary ms-1">
                                                +{getLinkStatBonus(spells, statKey)} =
                                            </span>
                                            <span className="text-muted ms-1">
                                                {characterStats[statKey] + getLinkStatBonus(spells, statKey)}
                                            </span>
                                        </div>
                                    )}

                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="character-stats">
            <DecorativeTitle title="STATS" lineMaxWidth='50px' />
            {renderStatGroup(STAT_CATEGORIES.PHYSICAL)}
            {renderStatGroup(STAT_CATEGORIES.MAGICAL)}
            {renderStatGroup(STAT_CATEGORIES.UTILITY)}
        </div>
    );
};

export default CharacterStats;