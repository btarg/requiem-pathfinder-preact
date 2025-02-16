import { useState, useEffect, useContext } from "preact/hooks";
import { DiceRoller } from "dice-roller-parser";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Tooltip } from 'bootstrap';
import { CharacterContext } from "../context/CharacterContext";
import { calculateStatBonus, getFriendlyDiceString, getFriendlyStatName, replaceDiceStats, validateDiceRoll, validateSpellFields } from "../utils/diceHelpers";
import { getSpellRank, STATS_CONFIG } from "../config/stats";
import Toast from "./Toast";
import { ElementType } from "../config/enums"
import { useSpellContext } from "../context/SpellContext";
import DeleteSpellModal from "./modals/DeleteSpellModal";
import EditSpellEntryModal from "./modals/EditSpellEntryModal";


const SpellManager = () => {
    const { characterStats, setCharacterStats } = useContext(CharacterContext);
    const { spells, setSpells, getLinkedStats } = useSpellContext();
    
    const defaultSpell = {
        name: "",
        quantity: 1,
        power: 1,
        dice: "",
        description: "",
        actions: 1,
        rank: 1,
        isLinked: false,
        linkedStat: "None", // See stats.js for the definitions
        element: ElementType.Acid
    };

    const [currentSpell, setCurrentSpell] = useState(defaultSpell);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [spellBeingEdited, setSpellBeingEdited] = useState(null);

    useEffect(() => {
        localStorage.setItem('spells', JSON.stringify(spells));
    }, [spells]);

    useEffect(() => {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(el => new Tooltip(el));

        return () => {
            tooltipList.forEach(tooltip => tooltip.dispose());
        };
    }, []);

    const openModal = (spell = null) => {
        setSpellBeingEdited(spell);
        setCurrentSpell(spell || defaultSpell);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSpellBeingEdited(null);
    };

    const [diceError, setDiceError] = useState("");

    const validateDiceString = (diceString) => {
        const result = validateDiceRoll(diceString, characterStats);
        setDiceError(result.error || "");
        return result.isValid;
    };

    const saveSpell = () => {
        const errors = validateSpellFields(currentSpell);

        if (errors.length > 0) {
            alert(`Please fix the following:\n${errors.join('\n')}`);
            return;
        }

        if (validateDiceString(currentSpell.dice)) {
            if (spellBeingEdited) {
                setSpells(spells.map(spell =>
                    spell.id === spellBeingEdited.id ?
                        { ...currentSpell, id: spellBeingEdited.id } :
                        spell
                ));
            } else {
                setSpells([...spells, { ...currentSpell, id: Date.now() }]);
            }
            closeModal();
        }
    };


    const rollSpellDamage = (spell) => {
        const roller = new DiceRoller();
        if (spell.quantity > 0 && spell.dice) {
            try {
                const diceWithStats = replaceDiceStats(spell.dice, characterStats);
                const friendlyDice = getFriendlyDiceString(spell.dice)
                const result = roller.roll(diceWithStats);
                alert(`Spell cast!\nFormula: ${friendlyDice}\nRoll: ${diceWithStats}\nResult: ${result.value}`);
                updateSpell(spell.id, "quantity", spell.quantity - 1);
            } catch (error) {
                alert(error.message || "Invalid dice format!");
            }
        } else {
            alert("No more charges of this spell remaining!");
        }
    };

    const [lastUpdate, setLastUpdate] = useState(null);

    const notifySpellQuantityChange = (spell, newQuantity, oldQuantity) => {
        const change = newQuantity - oldQuantity;
        const message = `${spell.name}: ${oldQuantity} → ${newQuantity} (${change >= 0 ? '+' : ''}${change})`;
        console.log(message);
        setLastUpdate(message);
    };

    const updateSpell = (id, key, value) => {
        const spell = spells.find(s => s.id === id);
        if (spell) {
            if (key === "quantity" && spell.quantity !== value) {
                notifySpellQuantityChange(spell, value, spell.quantity);
            }
            setSpells(spells.map(spell => spell.id === id ? { ...spell, [key]: value } : spell));
        }
    };

    const [spellToDelete, setSpellToDelete] = useState(null);

    const removeSpell = (id) => {
        setSpellToDelete(id);
    };

    const confirmDelete = () => {
        if (spellToDelete) {
            const spellToRemove = spells.find(s => s.id === spellToDelete);

            setSpells(spells.filter(spell => spell.id !== spellToDelete));
            setSpellToDelete(null);
            closeModal();
        }
    };

    const moveSpell = (index, direction) => {
        const newSpells = [...spells];
        const targetIndex = index + direction;
        if (targetIndex >= 0 && targetIndex < spells.length) {
            [newSpells[index], newSpells[targetIndex]] = [newSpells[targetIndex], newSpells[index]];
            setSpells(newSpells);
        }
    };


    const incrementPower = () => {
        const newPower = currentSpell.power + 1;
        setCurrentSpell({
            ...currentSpell,
            power: newPower,
            rank: getSpellRank(newPower)
        });
    };

    const decrementPower = () => {
        if (currentSpell.power > 1) {
            const newPower = currentSpell.power - 1;
            setCurrentSpell({
                ...currentSpell,
                power: newPower,
                rank: getSpellRank(newPower)
            });
        }
    };

    const [incrementAmount, setIncrementAmount] = useState(1);

    const incrementSpellQuantity = (id) => {
        const spell = spells.find(spell => spell.id === id);
        const newQuantity = Math.min(100, spell.quantity + incrementAmount);
        updateSpell(id, "quantity", newQuantity);
        // setIncrementAmount(1); // Reset after use
    };

    const decrementSpellQuantity = (id) => {
        const spell = spells.find(spell => spell.id === id);
        const newQuantity = Math.max(0, spell.quantity - incrementAmount);
        updateSpell(id, "quantity", newQuantity);
        // setIncrementAmount(1); // Reset after use
    };

    const getActionLabel = (actions) => {
        let label = "";
        let title = "";
        switch (actions) {
            case 0:
                label = "[free-action]";
                title = "Free Action";
                break;
            case 1:
                label = "[one-action]";
                title = "One Action";
                break;
            case 2:
                label = "[two-actions]";
                title = "Two Actions";
                break;
            case 3:
                label = "[three-actions]";
                title = "Three Actions";
                break;
            default:
                return "";
        }
        return (
            <span
                className="action"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                data-bs-original-title={title}
                title={title}
                role="img"
                aria-label={title}
            >
                {label}
            </span>
        );
    };

    return (
        <div className="spell-inventory" data-bs-theme="dark">
            <div className="container mt-4">
                <h2>Spell Inventory</h2>
                <button className="btn bt</div>n-primary mb-3" onClick={() => openModal()}>
                    <i className="fas fa-plus"></i> Add Spell
                </button>

                {lastUpdate && (
                    <Toast
                        message={lastUpdate}
                        onClose={() => setLastUpdate(null)}
                    />
                )}

                {/* // Debug display for stats
                <div className="mb-3">
                    {Object.entries(characterStats).map(([key, value]) => (
                        <span key={key} className="badge bg-secondary me-2">
                            {key}: {value}
                        </span>
                    ))}
                </div> */}

                {/* Spell list */}
                <ul className="list-group">
                    {spells.map((spell, index) => (
                        <li key={spell.id}
                            className="list-group-item d-flex justify-content-between align-items-center py-3 spell-item"
                            style={{ transition: 'background-color 0.3s' }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#2c3034'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = ''}>

                            <div className="d-flex align-items-center overflow-hidden" style={{ flex: '1 1 0' }}>
                                <span className="badge bg-primary me-3" style={{ minWidth: '3rem', flexShrink: 0 }}>
                                    {spell.quantity}
                                </span>
                                <span className="me-2" style={{ flexShrink: 0 }}>{getActionLabel(spell.actions)}</span>

                                {/* Spell name */}
                                <span className="text-truncate">{spell.name}</span>

                                {/* Link badge */}
                                {spell.isLinked && (
                                    <span
                                        className={`badge bg-dark border text-${STATS_CONFIG[spell.linkedStat].color || `primary`} ms-2`}
                                        data-bs-toggle="tooltip"
                                        title={STATS_CONFIG[spell.linkedStat].name}
                                    >
                                        <i className={`fas ${STATS_CONFIG[spell.linkedStat].icon} me-1`}></i>
                                        +{calculateStatBonus(spell.quantity, spell.rank)}
                                    </span>
                                )}
                                {/* Edit button */}
                                <i className="fas fa-edit text-primary ms-2"
                                    onClick={(e) => { e.stopPropagation(); openModal(spell); }}
                                    style={{ cursor: 'pointer', transition: 'opacity 0.3s', opacity: 0.6, flexShrink: 0 }}
                                    onMouseOver={(e) => { e.stopPropagation(); e.currentTarget.style.opacity = "1" }}
                                    onMouseOut={(e) => { e.stopPropagation(); e.currentTarget.style.opacity = "0.6" }}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title="Edit Spell"
                                />
                            </div>

                            <div className="d-flex align-items-center" style={{ flexShrink: 0, marginLeft: '1rem', gap: '0.5rem' }}>
                                {/* Roll button with fixed width */}
                                <button className="btn btn-outline-danger btn-sm"
                                    style={{ width: '120px', whiteSpace: 'nowrap', overflow: 'hidden' }}
                                    onClick={(e) => { e.stopPropagation(); rollSpellDamage(spell); }}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title="Roll Damage">
                                    <i className="fas fa-dice-d20"></i>
                                    <span className="ms-1 text-truncate">{getFriendlyDiceString(spell.dice)}</span>
                                </button>

                                {/* Quantity controls with fixed width */}
                                <div className="input-group input-group-sm" style={{ width: '140px', flexShrink: 0 }}>
                                    <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={(e) => { e.stopPropagation(); decrementSpellQuantity(spell.id); }}>
                                        <i className="fas fa-minus"></i>
                                    </button>
                                    <input
                                        type="number"
                                        className="form-control form-control-sm text-center"
                                        style={{ width: '60px' }}
                                        value={incrementAmount}
                                        onChange={(e) => setIncrementAmount(Math.max(1, Math.min(100, parseInt(e.currentTarget.value) || 1)))}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={(e) => { e.stopPropagation(); incrementSpellQuantity(spell.id); }}>
                                        <i className="fas fa-plus"></i>
                                    </button>
                                </div>

                                {/* Move buttons with fixed width */}
                                <div className="btn-group" style={{ flexShrink: 0 }}>
                                    <button className="btn btn-outline-secondary btn-sm"
                                        onClick={(e) => { e.stopPropagation(); moveSpell(index, 1); }}>
                                        <i className="fas fa-chevron-down"></i>
                                    </button>
                                    <button className="btn btn-outline-secondary btn-sm"
                                        onClick={(e) => { e.stopPropagation(); moveSpell(index, -1); }}>
                                        <i className="fas fa-chevron-up"></i>
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>

                {/* Edit Spell Entry Modal */}
                <EditSpellEntryModal
                    isModalOpen={isModalOpen}
                    closeModal={closeModal}
                    spellBeingEdited={spellBeingEdited}
                    currentSpell={currentSpell}
                    setCurrentSpell={setCurrentSpell}
                    incrementPower={incrementPower}
                    decrementPower={decrementPower}
                    getSpellRank={getSpellRank}
                    getActionLabel={getActionLabel}
                    ElementType={ElementType}
                    STATS_CONFIG={STATS_CONFIG}
                    getLinkedStats={getLinkedStats}
                    validateDiceRoll={validateDiceString}
                    diceError={diceError}
                    saveSpell={saveSpell}
                    removeSpell={removeSpell}
                />

                {/* Delete Confirmation Modal */}
                <DeleteSpellModal
                    spellToDelete={spellToDelete}
                    confirmDelete={confirmDelete}
                    setSpellToDelete={setSpellToDelete}
                />

            </div>
        </div>
    );
};

export default SpellManager;