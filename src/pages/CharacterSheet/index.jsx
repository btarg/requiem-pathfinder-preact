import './style.scss';
import HitPoints from '../../components/HitPoints';
import AffinityTracker from '../../components/AffinityTracker';
import DecorativeTitle from '../../components/DecorativeTitle';
import { getLinkStatBonus } from '../../utils/diceHelpers';
import { useContext } from 'preact/hooks';
import { CharacterContext } from '../../context/CharacterContext';
import { useSpellContext } from '../../context/SpellContext';

export function CharacterSheet() {

    const { spells } = useSpellContext();
    const { characterStats, setCharacterStats } = useContext(CharacterContext);

    const getSpeed = () => {
        return (characterStats.speed || 0) + getLinkStatBonus(spells, 'speed');
    }

    const updateHealth = (updates) => {
        setCharacterStats(prev => ({
            ...prev,
            ...updates
        }))
    }

    const handleMaxHealthChange = (e) => {
        const target = e.currentTarget;
        const newMax = Math.max(1, parseInt(target.value) || 1);
        updateHealth({ maxHealth: newMax });
        if (characterStats.currentHealth > newMax) {
            updateHealth({ currentHealth: newMax });
        }
    };

    const handleMaxMpChange = (e) => {
        const target = e.currentTarget;
        const newMax = Math.max(1, parseInt(target.value) || 1);
        updateHealth({ maxMp: newMax });
        if (characterStats.currentMp > newMax) {
            updateHealth({ currentMp: newMax });
        }
    };

    return (
        <div className="character-sheet container-fluid">
            <div className="column">
                <HitPoints />
                {/* Conditions Tracker Row & Affinity Tracker */}
                <div className="row justify-content-between mt-4">
                    <div className="col-md-7">
                        <AffinityTracker />
                    </div>
                    <div className="col-md-5 p-3">
                        <DecorativeTitle title="PLAYER CONDITION" />
                        <div className="row align-items-center mb-3">
                            {/* Left Column: Character Stat values: speed, AC - Wrapped in col-auto */}
                            <div className="col-auto">
                                <div className="d-flex gap-2">
                                    <div className="text-center">
                                        <small className="d-block mb-1 text-secondary">Speed</small>
                                        <input
                                            type="number"
                                            className="form-control form-control box-no-input text-center bg-dark text-light"
                                            id="speedInput"
                                            value={getSpeed() + 30} // Display speed
                                            readOnly // Make read-only
                                            aria-label="Speed"
                                        />
                                    </div>
                                    <div className="text-center">
                                        <small className="d-block mb-1 text-secondary">AC</small>
                                        <input
                                            type="number"
                                            className="form-control box-no-input text-center bg-dark text-light"
                                            id="acInput"
                                            value={characterStats.AC || 0} // Display AC
                                            readOnly // Make read-only
                                            aria-label="Armor Class"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Max Values - Wrapped in col-auto ms-auto */}
                            <div className="col-auto ms-auto">
                                <div className="d-flex gap-2">
                                    <div className="text-center">
                                        <small className="d-block mb-1 text-secondary">Max HP</small>
                                        <input
                                            type="number"
                                            className="form-control form-control hp-input text-center bg-dark text-light"
                                            id="maxHealthInput"
                                            value={characterStats.maxHealth || ''}
                                            onChange={handleMaxHealthChange}
                                            min="1"
                                            aria-label="Maximum Hit Points"
                                        />
                                    </div>
                                    <div className="text-center">
                                        <small className="d-block mb-1 text-secondary">Max MP</small>
                                        <input
                                            type="number"
                                            className="form-control form-control hp-input text-center bg-dark text-light"
                                            id="maxMpInput"
                                            value={characterStats.maxMp || ''}
                                            onChange={handleMaxMpChange}
                                            min="1"
                                            aria-label="Maximum Mana Points"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="conditions-tracker-placeholder p-3 border rounded bg-dark-subtle">
                            <h5 className="text-secondary-emphasis">CONDITIONS TRACKER</h5>
                            <p className="text-muted">(Placeholder for future implementation)</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}