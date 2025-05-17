import { useContext } from 'preact/hooks';
import { CharacterContext } from '../context/CharacterContext';
import { STATS_CONFIG } from '../config/stats';
import { STAT_CATEGORIES } from '../types/statTypes';
import { useSpellContext } from '../context/SpellContext';
import { getLinkStatBonus } from '../utils/diceHelpers';
import DecorativeTitle from './DecorativeTitle';
const CharacterStats = () => {
    const { characterStats, setCharacterStats } = useContext(CharacterContext);
    const { spells } = useSpellContext();

    const updateStat = (statName, value) => {
        setCharacterStats(prev => ({
            ...prev,
            [statName]: parseInt(value, 10) || 0
        }));
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
                                {/* Updated to add shortname text */}
                                <span className={`input-group-text gap-1 text-${config.color}`}
                                // style={{ borderColor: `var(--bs-${config.color}) !important` }}
                                >
                                    <i className={`fas ${config.icon}`}></i> <span class="stat-text">{config.shortName}</span>
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