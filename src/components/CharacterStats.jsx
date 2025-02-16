import { useContext } from 'preact/hooks';
import { CharacterContext } from '../context/CharacterContext';
import { STATS_CONFIG } from '../config/stats';
import { STAT_CATEGORIES } from '../types/statTypes';
import { useSpellContext } from '../context/SpellContext';
import { calculateStatBonus } from '../utils/diceHelpers';

const CharacterStats = () => {
    const { characterStats, setCharacterStats } = useContext(CharacterContext);
    const { spells } = useSpellContext();

    const updateStat = (statName, value) => {
        setCharacterStats(prev => ({
            ...prev,
            [statName]: parseInt(value, 10) || 0
        }));
    };

    const getStatBonus = (statKey) => {
        const linkedSpell = spells.find(spell => spell.isLinked && spell.linkedStat === statKey);
        return linkedSpell ? calculateStatBonus(linkedSpell.quantity, linkedSpell.rank) : 0;
    };

    const renderStatGroup = (category) => {
        const statsInCategory = Object.entries(STATS_CONFIG)
            .filter(([_, config]) => config.category === category);

        return statsInCategory.length > 0 && (
            <div className="stat-category mb-4">
                <h4 className="stat-category-title text-secondary mb-3">
                    {category.charAt(0).toUpperCase() + category.slice(1)} Stats
                </h4>
                <div className="stat-grid">
                    {statsInCategory.map(([statKey, config]) => (
                        <div key={statKey} className="stat-group mb-3">
                            <label
                                className="form-label d-flex justify-content-between align-items-center"
                                title={config.description}
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                            >
                                {config.name}
                            </label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className={`fas ${config.icon} text-${config.color || "secondary"}`}></i>
                                </span>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={characterStats[statKey] || 0}
                                    onChange={(e) => updateStat(statKey, e.currentTarget.value)}
                                />
                                <span className="input-group-text">
                                    <i className={`${getStatBonus(statKey) ? '' : 'fas fa-link-slash'} text-muted`}></i>
                                    {getStatBonus(statKey) ? `+${getStatBonus(statKey)}` : ''}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="character-stats p-4 bg-dark text-light rounded">
            <h3 className="mb-4">Stats</h3>
            {renderStatGroup(STAT_CATEGORIES.PHYSICAL)}
            {renderStatGroup(STAT_CATEGORIES.MAGICAL)}
            {renderStatGroup(STAT_CATEGORIES.UTILITY)}
        </div>
    );
};

export default CharacterStats;