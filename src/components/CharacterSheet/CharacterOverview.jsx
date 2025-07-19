import { useContext } from 'preact/hooks';
import { useSpellContext } from '../../context/SpellContext';
import { CharacterContext } from '../../context/CharacterContext';
import { getLinkStatBonus } from '../../utils/diceHelpers';
import { calculateConditionEffects } from '../../config/conditions';
import { BASE_AC, BASE_HP, BASE_SPD } from '../../config/constants';

export default function CharacterOverview() {
    const { spells } = useSpellContext();
    const { characterStats, setCharacterStats } = useContext(CharacterContext);

    const getSpeed = () => {
        const baseSpeed = (characterStats.speed || BASE_SPD) + getLinkStatBonus(spells, 'speed');
        const conditionEffects = calculateConditionEffects(characterStats.conditions);

        // If any condition sets speed to 0, return 0
        if (conditionEffects.speedOverride === 0) {
            return 0;
        }

        // Otherwise apply modifiers
        return Math.max(0, baseSpeed + conditionEffects.speedModifier);
    };

    const getAC = () => {
        const baseAC = characterStats.AC || BASE_AC;
        const conditionEffects = calculateConditionEffects(characterStats.conditions);
        return baseAC + conditionEffects.acModifier;
    };

    const updateCharacterStats = (updates) => {
        setCharacterStats(prev => ({
            ...prev,
            ...updates
        }))
    }

    const handleMaxHealthChange = (e) => {
        const target = e.currentTarget;
        const newMax = Math.max(1, parseInt(target.value) || BASE_HP);
        updateCharacterStats({ maxHealth: newMax });
        if (characterStats.currentHealth > newMax) {
            updateCharacterStats({ currentHealth: newMax });
        }
    };

    const handleMaxMpChange = (e) => {
        const target = e.currentTarget;
        const newMax = Math.max(1, parseInt(target.value) || 1);
        updateCharacterStats({ maxMp: newMax });
        if (characterStats.currentMp > newMax) {
            updateCharacterStats({ currentMp: newMax });
        }
    };

    const handleBaseACChange = (e) => {
        const target = e.currentTarget;
        const newAC = Math.max(0, parseInt(target.value) || BASE_AC);
        setCharacterStats(prev => ({
            ...prev,
            AC: newAC
        }));
    };

    const handleBaseSpeedChange = (e) => {
        const target = e.currentTarget;
        const newSpeed = Math.max(0, parseInt(target.value) || BASE_SPD);
        setCharacterStats(prev => ({
            ...prev,
            speed: newSpeed
        }));
    };

    return (
        <div className="character-overview-component container-fluid mb-4">
            {/* Desktop Layout */}
            <div className="row align-items-center mb-3 d-none d-md-flex">
                {/* Left Column: Character Stat values: speed, AC */}
                <div className="col-auto">
                    <div className="d-flex gap-2">
                        <div className="text-center">
                            <small className="d-block mb-1 text-secondary">Speed</small>
                            <input
                                type="number"
                                className={`form-control form-control box-no-input text-center bg-dark ${calculateConditionEffects(characterStats.conditions).speedModifier !== 0 ||
                                    calculateConditionEffects(characterStats.conditions).speedOverride === 0
                                    ? 'text-warning' : 'text-light'
                                    }`}
                                id="speedInput"
                                value={getSpeed()}
                                readOnly
                                aria-label="Speed"
                                title={
                                    calculateConditionEffects(characterStats.conditions).speedModifier !== 0 ||
                                        calculateConditionEffects(characterStats.conditions).speedOverride === 0
                                        ? 'Speed modified by conditions' : 'Speed'
                                }
                            />
                        </div>
                        <div className="text-center">
                            <small className="d-block mb-1 text-secondary">AC</small>
                            <input
                                type="number"
                                className={`form-control box-no-input text-center bg-dark ${calculateConditionEffects(characterStats.conditions).acModifier !== 0
                                    ? 'text-warning' : 'text-light'
                                    }`}
                                id="acInput"
                                value={getAC()}
                                readOnly
                                aria-label="Armor Class"
                                title={
                                    calculateConditionEffects(characterStats.conditions).acModifier !== 0
                                        ? 'AC modified by conditions' : 'Armor Class'
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Max Values */}
                <div className="col-auto ms-auto">
                    <div className="d-flex gap-2">
                        <div className="text-center">
                            <small className="d-block mb-1 text-secondary">Base AC</small>
                            <input
                                type="number"
                                className="form-control form-control hp-input text-center bg-dark text-light"
                                id="baseACInput"
                                value={characterStats.AC || 10}
                                onChange={handleBaseACChange}
                                min="0"
                                aria-label="Base Armor Class"
                            />
                        </div>
                        <div className="text-center">
                            <small className="d-block mb-1 text-secondary">Base Speed</small>
                            <input
                                type="number"
                                className="form-control form-control hp-input text-center bg-dark text-light"
                                id="baseSpeedInput"
                                value={characterStats.speed || 15}
                                onChange={handleBaseSpeedChange}
                                min="0"
                                aria-label="Base Speed"
                            />
                        </div>
                        <div className="text-center">
                            <small className="d-block mb-1 text-secondary">Max HP</small>
                            <input
                                type="number"
                                className="form-control form-control hp-input text-center bg-dark text-light"
                                id="maxHealthInput"
                                value={characterStats.maxHealth || 35}
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
                                value={characterStats.maxMp || 1}
                                onChange={handleMaxMpChange}
                                min="1"
                                aria-label="Maximum Mana Points"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile/Tablet Layout */}
            <div className="d-md-none">
                {/* Current Stats Row - Larger touch targets */}
                <div className="row mb-3">
                    <div className="col-6">
                        <div className="text-center p-2 border rounded bg-dark">
                            <small className="d-block mb-2 text-secondary fw-bold">SPEED</small>
                            <div
                                className={`fs-4 fw-bold ${calculateConditionEffects(characterStats.conditions).speedModifier !== 0 ||
                                    calculateConditionEffects(characterStats.conditions).speedOverride === 0
                                    ? 'text-warning' : 'text-light'
                                    }`}
                                title={
                                    calculateConditionEffects(characterStats.conditions).speedModifier !== 0 ||
                                        calculateConditionEffects(characterStats.conditions).speedOverride === 0
                                        ? 'Speed modified by conditions' : 'Speed'
                                }
                            >
                                {getSpeed()}
                            </div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="text-center p-2 border rounded bg-dark">
                            <small className="d-block mb-2 text-secondary fw-bold">AC</small>
                            <div
                                className={`fs-4 fw-bold ${calculateConditionEffects(characterStats.conditions).acModifier !== 0
                                    ? 'text-warning' : 'text-light'
                                    }`}
                                title={
                                    calculateConditionEffects(characterStats.conditions).acModifier !== 0
                                        ? 'AC modified by conditions' : 'Armor Class'
                                }
                            >
                                {getAC()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Base Stats Row */}
                <div className="row mb-2">
                    <div className="col-6">
                        <div className="text-center">
                            <small className="d-block mb-1 text-secondary">Base Speed</small>
                            <input
                                type="number"
                                className="form-control text-center bg-dark text-light"
                                value={characterStats.speed || 15}
                                onChange={handleBaseSpeedChange}
                                min="0"
                                aria-label="Base Speed"
                                style={{ fontSize: '1.1rem', padding: '0.75rem' }}
                            />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="text-center">
                            <small className="d-block mb-1 text-secondary">Base AC</small>
                            <input
                                type="number"
                                className="form-control text-center bg-dark text-light"
                                value={characterStats.AC || 10}
                                onChange={handleBaseACChange}
                                min="0"
                                aria-label="Base Armor Class"
                                style={{ fontSize: '1.1rem', padding: '0.75rem' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Max Values Row */}
                <div className="row">
                    <div className="col-6">
                        <div className="text-center">
                            <small className="d-block mb-1 text-secondary">Max HP</small>
                            <input
                                type="number"
                                className="form-control text-center bg-dark text-light"
                                value={characterStats.maxHealth || 35}
                                onChange={handleMaxHealthChange}
                                min="1"
                                aria-label="Maximum Hit Points"
                                style={{ fontSize: '1.1rem', padding: '0.75rem' }}
                            />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="text-center">
                            <small className="d-block mb-1 text-secondary">Max MP</small>
                            <input
                                type="number"
                                className="form-control text-center bg-dark text-light"
                                value={characterStats.maxMp || 1}
                                onChange={handleMaxMpChange}
                                min="1"
                                aria-label="Maximum Mana Points"
                                style={{ fontSize: '1.1rem', padding: '0.75rem' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
