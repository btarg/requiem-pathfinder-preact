import { useState, useEffect, useContext } from "preact/hooks";
import { DiceRoller } from "dice-roller-parser";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Tooltip } from 'bootstrap';
import { CharacterContext } from "../context/CharacterContext";
import { getFriendlyDiceString, getFriendlyStatName, replaceDiceStats, validateDiceRoll } from "../utils/diceHelpers";


const SpellManager = () => {
    const { characterStats } = useContext(CharacterContext);

    const [spells, setSpells] = useState(() => {
        const savedSpells = localStorage.getItem('spells');
        return savedSpells ? JSON.parse(savedSpells) : [];
    });
    const [currentSpell, setCurrentSpell] = useState({
        name: "",
        quantity: 1,
        power: 1,
        dice: "",
        description: "",
        actions: 1
    });
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
        setCurrentSpell(spell || {
            name: "",
            quantity: 1,
            power: 1,
            dice: "",
            description: "",
            actions: 1
        });
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
        if (currentSpell.name && validateDiceRoll(currentSpell.dice)) {
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
    
    const updateSpell = (id, key, value) => {
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

    const incrementQuantity = () => {
        setCurrentSpell({ ...currentSpell, quantity: currentSpell.quantity + 1 });
    };

    const decrementQuantity = () => {
        if (currentSpell.quantity > 0) {
            setCurrentSpell({ ...currentSpell, quantity: currentSpell.quantity - 1 });
        }
    };

    const incrementPower = () => {
        setCurrentSpell({ ...currentSpell, power: currentSpell.power + 1 });
    };

    const decrementPower = () => {
        if (currentSpell.power > 1) {
            setCurrentSpell({ ...currentSpell, power: currentSpell.power - 1 });
        }
    };

    const incrementSpellQuantity = (id) => {
        updateSpell(id, "quantity", spells.find(spell => spell.id === id).quantity + 1);
    };

    const decrementSpellQuantity = (id) => {
        const spell = spells.find(spell => spell.id === id);
        if (spell.quantity > 1) {
            updateSpell(id, "quantity", spell.quantity - 1);
        }
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
                <button className="btn btn-primary mb-3" onClick={() => openModal()}>
                    <i className="fas fa-plus"></i> Add Spell
                </button>

                <div className="mb-3">
                    {Object.entries(characterStats).map(([key, value]) => (
                        <span key={key} className="badge bg-secondary me-2">
                            {key}: {value}
                        </span>
                    ))}
                </div>

                <ul className="list-group">
                    {spells.map((spell, index) => (
                        <li key={spell.id}
                            className="list-group-item d-flex justify-content-between align-items-center py-3 spell-item"
                            onClick={_ => rollSpellDamage(spell)}
                            style={{ cursor: 'pointer', transition: 'background-color 0.3s' }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#2c3034'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = ''}>
                            <div className="d-flex align-items-center me-2">
                                <span className="me-2">{getActionLabel(spell.actions)}</span><span className="me-2">{spell.name}</span>
                                <i className="fas fa-edit text-primary me-2"
                                    onClick={(e) => { e.stopPropagation(); openModal(spell); }}
                                    style={{ cursor: 'pointer', transition: 'opacity 0.3s', opacity: 0.6 }}
                                    onMouseOver={(e) => { e.stopPropagation(); e.currentTarget.style.opacity = "1" }}
                                    onMouseOut={(e) => { e.stopPropagation(); e.currentTarget.style.opacity = "0.6" }}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title="Edit Spell">
                                </i>
                            </div>
                            <div className="d-flex align-items-center">
                                {/* Button to roll the damage with a d20 icon (red outline) */}
                                <button className="btn btn-outline-danger btn-sm me-2"
                                    onClick={(e) => { e.stopPropagation(); rollSpellDamage(spell); }}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title="Roll Damage">
                                    <i className="fas fa-dice-d20 me-2"></i>
                                    {getFriendlyDiceString(spell.dice)}
                                </button>

                                <button className="btn btn-outline-primary btn-sm me-2"
                                    onClick={(e) => { e.stopPropagation(); decrementSpellQuantity(spell.id); }}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title="Decrease Spell Charges">
                                    <i className="fas fa-minus"></i>
                                </button>
                                <span className="badge bg-primary rounded-pill me-2">{spell.quantity}</span>
                                <button className="btn btn-outline-primary btn-sm me-2"
                                    onClick={(e) => { e.stopPropagation(); incrementSpellQuantity(spell.id); }}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title="Increase Spell Charges">
                                    <i className="fas fa-plus"></i>
                                </button>

                                <div className="btn-group me-2">
                                    <button className="btn btn-outline-secondary btn-sm"
                                        onClick={(e) => { e.stopPropagation(); moveSpell(index, 1); }}
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        title="Move Spell Down">
                                        <i className="fas fa-chevron-down"></i>
                                    </button>
                                    <button className="btn btn-outline-secondary btn-sm"
                                        onClick={(e) => { e.stopPropagation(); moveSpell(index, -1); }}
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        title="Move Spell Up">
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
                                    <input type="text" className="form-control" placeholder="Spell Name" value={currentSpell.name}
                                        onInput={(e) => setCurrentSpell({ ...currentSpell, name: e.currentTarget.value })} />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label">Quantity</label>
                                    <div className="input-group">
                                        <button className="btn btn-outline-secondary" type="button" onClick={decrementQuantity}>
                                            <i className="fas fa-minus"></i>
                                        </button>
                                        <input type="number" className="form-control" placeholder="Quantity" min="0" value={currentSpell.quantity}
                                            onInput={(e) => setCurrentSpell({ ...currentSpell, quantity: parseInt(e.currentTarget.value, 10) })} />
                                        <button className="btn btn-outline-secondary" type="button" onClick={incrementQuantity}>
                                            <i className="fas fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label">Power Level</label>
                                    <div className="input-group">
                                        <button className="btn btn-outline-secondary" type="button" onClick={decrementPower}>
                                            <i className="fas fa-minus"></i>
                                        </button>
                                        <input type="number" className="form-control" placeholder="Power Level" min="0" value={currentSpell.power}
                                            onInput={(e) => setCurrentSpell({ ...currentSpell, power: parseInt(e.currentTarget.value, 10) })} />
                                        <button className="btn btn-outline-secondary" type="button" onClick={incrementPower}>
                                            <i className="fas fa-plus"></i>
                                        </button>
                                    </div>
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


                                <div className="mb-2">
                                    <label className="form-label">Spell Description</label>
                                    <textarea className="form-control" placeholder="Spell Description" value={currentSpell.description}
                                        onInput={(e) => setCurrentSpell({ ...currentSpell, description: e.currentTarget.value })} />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label">Actions to Cast</label>
                                    <select className="form-select" value={currentSpell.actions}
                                        onChange={(e) => setCurrentSpell({ ...currentSpell, actions: parseInt(e.currentTarget.value, 10) })}>
                                        <option value="1">1 Action</option>
                                        <option value="2">2 Actions</option>
                                        <option value="3">3 Actions</option>
                                    </select>
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