import { useContext, useEffect } from 'preact/hooks';
import { CharacterContext } from '../context/CharacterContext';

const CharacterStats = () => {
    const { characterStats, setCharacterStats } = useContext(CharacterContext);

    // Add debugging to track changes
    useEffect(() => {
        console.log('CharacterStats updated:', characterStats);
    }, [characterStats]);

    const updateSpellAttackModifier = (value) => {
        console.log('Updating spell modifier to:', value);
        setCharacterStats(prev => {
            const newStats = {
                ...prev,
                spellAttackModifier: parseInt(value, 10) || 0
            };
            console.log('New stats:', newStats);
            return newStats;
        });
    };

    return (
        <div className="character-stats p-3 bg-dark text-light rounded">
            <h3>Character Stats</h3>
            <div className="input-group mb-3">
                <span className="input-group-text">
                    <i className="fas fa-magic"></i>
                </span>
                <input
                    type="number"
                    className="form-control"
                    placeholder="Spell Attack Modifier"
                    value={characterStats.spellAttackModifier}
                    onChange={(e) => updateSpellAttackModifier(e.currentTarget.value)}
                />
                <span className="input-group-text">
                    {characterStats.spellAttackModifier >= 0 ? '+' : ''}{characterStats.spellAttackModifier}
                </span>
            </div>
        </div>
    );
};

export default CharacterStats;