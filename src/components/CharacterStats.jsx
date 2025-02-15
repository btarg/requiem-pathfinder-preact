import { useContext, useEffect } from 'preact/hooks';
import { CharacterContext } from '../context/CharacterContext';
import { STATS_CONFIG } from '../config/stats';
import { STAT_CATEGORIES } from '../types/statTypes';

const CharacterStats = () => {
    const { characterStats, setCharacterStats } = useContext(CharacterContext);

    useEffect(() => {
        console.log('CharacterStats updated:', characterStats);
    }, [characterStats]);

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
                                    <i className={`fas ${config.icon}`}></i>
                                </span>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={characterStats[statKey] || 0}
                                    onChange={(e) => updateStat(statKey, e.currentTarget.value)}
                                />
                                {config.displayModifier && (
                                    <span className="input-group-text">
                                        {characterStats[statKey] >= 0 ? '+' : ''}{characterStats[statKey] || 0}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="character-stats p-4 bg-dark text-light rounded">
            <h3 className="mb-4">Character Stats</h3>
            {renderStatGroup(STAT_CATEGORIES.PHYSICAL)}
            {renderStatGroup(STAT_CATEGORIES.MAGICAL)}
            {renderStatGroup(STAT_CATEGORIES.UTILITY)}
        </div>
    );
};

export default CharacterStats;