import { useState, useEffect, useContext } from "preact/hooks";
import { DiceRoller } from "dice-roller-parser";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Tooltip } from 'bootstrap';
import { CharacterContext } from "../context/CharacterContext";
import { getFriendlyDiceString, getFriendlyStatName, replaceDiceStats, validateDiceRoll, validateSpellFields } from "../utils/diceHelpers";
import { getSpellRank } from "../config/stats";
import Toast from "./Toast";


const SpellManager = () => {
    const { characterStats } = useContext(CharacterContext);

    const [spells, setSpells] = useState(() => {
        const savedSpells = localStorage.getItem('spells');
        return savedSpells ? JSON.parse(savedSpells) : [];
    });
    const defaultSpell = {
        name: "",
        quantity: 1,
        power: 1,
        dice: "",
        description: "",
        actions: 1,
        rank: 1,
        isLinked: false,
        linkedStat: "strength" // Default linked stat
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
        if (key === "quantity") {
            const spell = spells.find(s => s.id === id);
            if (spell && spell.quantity !== value) {
                notifySpellQuantityChange(spell, value, spell.quantity);
            }
        }
        setSpells(spells.map(spell => spell.id === id ? { ...spell, [key]: value } : spell));
    };

    const [spellToDelete, setSpellToDelete] = useState(null);

    const removeSpell = (id) => {
        setSpellToDelete(id);
    };

    const confirmDelete = () => {
        if (spellToDelete) {
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
        setIncrementAmount(1); // Reset after use
    };

    const decrementSpellQuantity = (id) => {
        const spell = spells.find(spell => spell.id === id);
        const newQuantity = Math.max(0, spell.quantity - incrementAmount);
        updateSpell(id, "quantity", newQuantity);
        setIncrementAmount(1); // Reset after use
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
                                <span className="badge bg-primary rounded-pill me-3" style={{ minWidth: '3rem', flexShrink: 0 }}>
                                    {spell.quantity}
                                </span>
                                <span className="me-2" style={{ flexShrink: 0 }}>{getActionLabel(spell.actions)}</span>
                                <span className="text-truncate">{spell.name}</span>
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

                <div className={`modal ${isModalOpen ? 'show' : ''}`} style={{ display: isModalOpen ? 'block' : 'none' }} tabIndex={-1}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{spellBeingEdited ? "Edit Spell Entry" : "Add Spell"}</h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-2">
                                    <label className="form-label">Spell Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Spell Name"
                                        value={currentSpell.name}
                                        onInput={(e) => setCurrentSpell({
                                            ...currentSpell,
                                            name: e.currentTarget.value
                                        })}
                                    />
                                </div>


                                <div className="mb-2">
                                    <label className="form-label">Spell Level</label>
                                    <div className="input-group">
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={decrementPower}
                                            disabled={currentSpell.power <= 1}
                                        >
                                            <i className="fas fa-minus"></i>
                                        </button>
                                        <input
                                            type="number"
                                            className={`form-control ${currentSpell.power <= 0 ? 'is-invalid' : ''}`}
                                            placeholder="Spell Level"
                                            min="1"
                                            value={currentSpell.power}
                                            onInput={(e) => {
                                                const value = Math.max(1, parseInt(e.currentTarget.value, 10) || 1);
                                                setCurrentSpell({
                                                    ...currentSpell,
                                                    power: value,
                                                    rank: getSpellRank(value)
                                                });
                                            }}
                                        />
                                        <button className="btn btn-outline-secondary" type="button"
                                            onClick={incrementPower}>
                                            <i className="fas fa-plus"></i>
                                        </button>
                                        {currentSpell.power <= 0 && (
                                            <div className="invalid-feedback">
                                                Spell level must be at least 1
                                            </div>
                                        )}
                                    </div>
                                    
                                </div>
                                <div className="alert alert-info py-1 mb-2">
                                    <i className="fas fa-link me-2"></i>
                                    <small className="text-muted d-block mt-1">
                                        This spell's <a href="https://docs.google.com/document/d/1ZTxCemR8j6GhIMqhvmBd7kOo8wNsOisO_vOutlQBYv0/edit?tab=t.0" target="_blank">Soul Link Rank</a> will be <b>{getSpellRank(currentSpell.power)}.</b>
                                    </small>
                                </div>

                                <label className="form-label">Actions to Cast</label>
                                <div className="input-group mb-2">
                                    <span className="input-group-text">
                                        {getActionLabel(currentSpell.actions)}
                                    </span>
                                    <select className="form-select" value={currentSpell.actions}
                                        onChange={(e) => setCurrentSpell({ ...currentSpell, actions: parseInt(e.currentTarget.value) })}>
                                        <option value="1">1 Action</option>
                                        <option value="2">2 Actions</option>
                                        <option value="3">3 Actions</option>
                                        <option value="0">Free Action</option>
                                    </select>
                                </div>

                                <label className="form-label">Damage Roll(s)</label>
                                <div className="input-group mb-2">
                                    <span className="input-group-text">
                                        <i className="fas fa-dice-d20"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className={`form-control ${diceError ? 'is-invalid' : ''}`}
                                        placeholder="Dice Roll (e.g. 1d4)"
                                        value={currentSpell.dice}
                                        onInput={(e) => {
                                            const value = e.currentTarget.value;
                                            setCurrentSpell({ ...currentSpell, dice: value });
                                            validateDiceRoll(value);
                                        }}
                                    />
                                    {diceError && (
                                        <div className="invalid-feedback">
                                            {diceError}
                                        </div>
                                    )}
                                </div>
                                <div className="alert alert-info py-1 mb-2">
                                    <i className="fas fa-info-circle me-2"></i>
                                    <small>Use [stat] to include a stat's value (e.g., [strength] + 1d6)</small>
                                </div>


                                <div className="mb-2">
                                    <label className="form-label">Spell Description</label>
                                    <textarea className="form-control" placeholder="Spell Description" value={currentSpell.description}
                                        onInput={(e) => setCurrentSpell({ ...currentSpell, description: e.currentTarget.value })} />
                                </div>

                                {/* Quantity input */}
                                <div className="mb-2">
                                    <label className="form-label">Amount currently stocked <i>("Spell Charges")</i></label>
                                    <div className="input-group">
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={decrementSpellQuantity}
                                            disabled={currentSpell.quantity <= 1}
                                        >
                                            <i className="fas fa-minus"></i>
                                        </button>
                                        <input
                                            type="number"
                                            className={`form-control ${currentSpell.quantity <= 0 || currentSpell.quantity > 100 ? 'is-invalid' : ''}`}
                                            placeholder="Quantity"
                                            min="1"
                                            max="100"
                                            value={currentSpell.quantity}
                                            onInput={(e) => {
                                                const value = parseInt(e.currentTarget.value, 10) || 0;
                                                if (value > 100) {
                                                    setCurrentSpell({ ...currentSpell, quantity: 100 });
                                                } else {
                                                    setCurrentSpell({ ...currentSpell, quantity: Math.max(0, value) });
                                                }
                                            }}
                                        />
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={incrementSpellQuantity}
                                            disabled={currentSpell.quantity >= 100}
                                        >
                                            <i className="fas fa-plus"></i>
                                        </button>
                                        {(currentSpell.quantity <= 0 || currentSpell.quantity > 100) && (
                                            <div className="invalid-feedback d-block">
                                                Quantity must be between 1 and 100
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    <i className="fas fa-times me-1"></i>Close
                                </button>
                                {spellBeingEdited && (
                                    <button type="button"
                                        className="btn btn-danger"
                                        onClick={() => removeSpell(spellBeingEdited.id)}>
                                        <i className="fas fa-trash-alt me-1"></i>Delete
                                    </button>
                                )}
                                <button type="button" className="btn btn-success" onClick={saveSpell}>
                                    <i className={`fas ${spellBeingEdited ? 'fa-save' : 'fa-plus'} me-1`}></i>
                                    {spellBeingEdited ? "Save Changes" : "Add Spell"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                <div className={`modal fade ${spellToDelete ? 'show' : ''}`}
                    style={{ display: spellToDelete ? 'block' : 'none' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Deletion</h5>
                                <button type="button"
                                    className="btn-close"
                                    onClick={() => setSpellToDelete(null)}
                                    aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                Are you sure you want to delete this spell?
                            </div>
                            <div className="modal-footer">
                                <button type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setSpellToDelete(null)}>
                                    No, Keep It
                                </button>
                                <button type="button"
                                    className="btn btn-danger"
                                    onClick={confirmDelete}>
                                    Yes, Delete It
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SpellManager;