import { useContext } from 'preact/hooks';
import { CharacterContext } from '../../context/CharacterContext';
import { useSpellContext } from '../../context/SpellContext';
import ToastManager from '../ToastManager';
import { STAT_CATEGORIES } from '../../types/statTypes';
import { STATS_CONFIG } from '../../config/stats';
import { getLinkStatBonus } from '../../utils/diceHelpers';
import { capitalizeFirstLetter } from '../../utils/commonUtils';
import { getStatConditionModifier } from '../../config/conditions';
import DecorativeTitle from '../DecorativeTitle';
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

    // Calculate total allocated stat points (excluding CORE stats)
    const statTotal = Object.entries(characterStats)
        .filter(([statKey]) => STATS_CONFIG[statKey]?.category !== STAT_CATEGORIES.CORE)
        .reduce((acc, [_, val]) => acc + (parseInt(val, 10) || 0), 0);

    const copyStatCheckRoll = (stat) => {
        // Ask the user to input a DC, where leaving it as zero will just do a normal roll
        const dc = prompt("Enter a DC for the roll (leave blank for normal roll):");
        
        // if cancelled, return
        if (dc === null) return;

        const dcValue = Math.max(0, parseInt(dc, 10));
        
        // Base roll calculation with the bonus
        const statBonus = (characterStats[stat] || 0) + getLinkStatBonus(spells, stat);
        const conditionModifier = getStatConditionModifier(characterStats.conditions, stat);
        const totalBonus = statBonus + conditionModifier;
        const statConfig = STATS_CONFIG[stat];
        
        // Build the roll command
        let roll = `1d20+${totalBonus}`;
        if (dcValue > 1) {
            roll = `${roll}cs>=${dcValue}cf<${dcValue}`;
        }
        const checkString = dcValue ? `check vs DC ${dcValue}` : 'check';
        const command = `&{template:default} {{name=${capitalizeFirstLetter(stat)} ${checkString}}}` +
                       `{{Roll=[[${roll}]]}}` +
                       `{{Stat Bonus=[[${statBonus}]] from ${statConfig.shortName}}}` +
                       (conditionModifier !== 0 ? `{{Condition Modifier=[[${conditionModifier}]]}}` : '');
        
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
                <h6 className="stat-category-title text-secondary mb-2">
                    {category.toUpperCase()}
                </h6>
                
                {/* <DecorativeTitle title={category.toUpperCase()} lineMaxWidth='25px' titleClassName='h6 text-secondary' containerClassName='mb-2' lineColor='var(--bs-secondary)' /> */}
                <div className="stat-grid">
                    {statsInCategory.map(([statKey, config]) => (
                        <div
                            key={statKey}
                            className="stat-group mb-2"
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
                                    {(() => {
                                        const spellBonus = getLinkStatBonus(spells, statKey);
                                        const conditionModifier = getStatConditionModifier(characterStats.conditions, statKey);
                                        const totalModifier = spellBonus + conditionModifier;
                                        
                                        if (totalModifier > 0) {
                                            return (
                                                <div>
                                                    <span className="text-secondary ms-1">
                                                        +{totalModifier} =
                                                    </span>
                                                    <span className="text-muted ms-1">
                                                        {characterStats[statKey] + totalModifier}
                                                    </span>
                                                </div>
                                            );
                                        } else if (totalModifier < 0) {
                                            return (
                                                <div>
                                                    <span className="text-danger ms-1">
                                                        {totalModifier} =
                                                    </span>
                                                    <span className="text-muted ms-1">
                                                        {characterStats[statKey] + totalModifier}
                                                    </span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
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
            <DecorativeTitle title="STATS" lineMaxWidth='50px' containerClassName='mb-1' />
            {/* <DecorativeTitle title={`BASE ALLOCATED POINTS: ${statTotal}`} lineMaxWidth='50px' titleClassName='h6 text-danger' /> */}
            <h6 className="stat-category-title text-danger mb-4">
                BASE ALLOCATED POINTS: {statTotal}
            </h6>
            {renderStatGroup(STAT_CATEGORIES.PHYSICAL)}
            {renderStatGroup(STAT_CATEGORIES.MAGICAL)}
            {renderStatGroup(STAT_CATEGORIES.UTILITY)}
        </div>
    );
};

export default CharacterStats;