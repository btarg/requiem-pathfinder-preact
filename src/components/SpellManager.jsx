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
import LinkSpellModal from "./modals/LinkSpellModal";
import { capitalizeFirstLetter } from "../utils/commonUtils";


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
    const [spellBeingEdited, setSpellBeingEdited] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

    const [expandedSpellId, setExpandedSpellId] = useState(null);

    const toggleExpandSpell = (id) => {
        setExpandedSpellId(expandedSpellId === id ? null : id);
    };

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

    const openEditModal = (spell = null) => {
        setSpellBeingEdited(spell);
        setCurrentSpell(spell || defaultSpell);
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => {
        setSpellBeingEdited(null);
        setIsEditModalOpen(false);
    };

    const openLinkModal = (spell = null) => {
        setSpellBeingEdited(spell);
        setCurrentSpell(spell || defaultSpell);
        setIsLinkModalOpen(true);
    };
    const closeLinkModal = () => {
        setSpellBeingEdited(null);
        setIsLinkModalOpen(false);
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

            if (isEditModalOpen)
                closeEditModal();

            if (isLinkModalOpen)
                closeLinkModal();
        }
    };


    const rollSpellDamage = (spell) => {
        if (spell.quantity > 0 && spell.dice) {
            try {
                const diceWithStats = replaceDiceStats(spell.dice, characterStats);
                const friendlyDice = getFriendlyDiceString(spell.dice, characterStats)
                const result = new DiceRoller().roll(diceWithStats);
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
            closeEditModal();
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

    const getElementIcon = (element) => {
        switch (element) {
            case ElementType.Acid:
                return '🧪';
            case ElementType.Cold:
                return '❄️';
            case ElementType.Electricity:
                return '⚡';
            case ElementType.Fire:
                return '🔥';
            case ElementType.Sonic:
                return '🔊';
            default:
                return '⚔️';
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
                data-bs-original-title={title}
                title={title}
                role="img"
                aria-label={title}
            >
                {label}
            </span>
        );
    };

    const handleBadgeClick = (spell) => {
        if (spell.isLinked) {
            console.log(`Linked stat: ${spell.linkedStat}`);
        } else {
            console.log('No linked stat');
        }
        openLinkModal(spell);
    };

    return (
        <div className="spell-inventory" data-bs-theme="dark">
            <div className="container">
                <h2>Spell Inventory</h2>
                <button className="btn bt</div>n-primary mb-3" onClick={() => openEditModal()}>
                    <i className="fas fa-plus"></i> Add Spell
                </button>

                {lastUpdate && (
                    <Toast
                        message={lastUpdate}
                        onClose={() => setLastUpdate(null)}
                    />
                )}

                {/* <div className="mb-3">
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
                            className="list-group-item spell-item"
                            style={{ transition: 'background-color 0.3s' }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#2c3034'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = ''}
                        >
                            <div class="d-flex justify-content-left">
                                <div className="d-flex align-items-center overflow-hidden" style={{ flex: '1 1 0' }}
                                    onClick={() => toggleExpandSpell(spell.id)}>
                                    <span className="badge bg-primary me-2" style={{ width: '2.5rem', flexShrink: 0 }}>
                                        <small>{spell.quantity}</small>
                                    </span>
                                    {/* Action Label */}
                                    <div class="text-truncate">
                                        <span className="action-label hide-on-small me-2" style={{
                                            width: window.innerWidth <= 750 ? '0px' : '50px',
                                        }}>
                                            {getActionLabel(spell.actions)}
                                        </span>
                                        <span>{spell.name}</span>
                                    </div>

                                </div>

                                <div className="d-flex align-items-center justify-content-right" style={{ gap: '0.5rem' }}>
                                    {/* Edit button */}
                                    <i className="fas fa-edit text-primary"
                                        onClick={(e) => { e.stopPropagation(); openEditModal(spell); }}
                                        style={{ cursor: 'pointer', transition: 'opacity 0.3s', opacity: 0.6, flexShrink: 0 }}
                                        onMouseOver={(e) => { e.stopPropagation(); e.currentTarget.style.opacity = "1" }}
                                        onMouseOut={(e) => { e.stopPropagation(); e.currentTarget.style.opacity = "0.6" }}
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        title="Edit Spell"
                                    />

                                    {/* Link badge */}
                                    <span
                                        className={`badge bg-dark border text-${spell.isLinked ? STATS_CONFIG[spell.linkedStat].color : 'secondary'} ms-2 d-flex justify-content-between align-items-center link-badge-normal`}
                                        data-bs-toggle="tooltip"
                                        data-bs-original-title=""
                                        title={spell.isLinked ? "Linked to " + STATS_CONFIG[spell.linkedStat].name : 'No linked stat'}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleBadgeClick(spell);
                                        }}
                                        style={{
                                            cursor: 'pointer',
                                            width: '4rem',
                                        }}
                                    >
                                        <i className={`fas ${spell.isLinked ? STATS_CONFIG[spell.linkedStat].icon : 'fa-link-slash'}`}></i>
                                        <span>{spell.isLinked ? `+${calculateStatBonus(spell.quantity, spell.rank)}` : ''}</span>
                                    </span>

                                    {/* Roll button with fixed width */}
                                    <button className="btn btn-outline-danger btn-sm roll-button"
                                        style={{ width: '120px', whiteSpace: 'nowrap', overflow: 'hidden' }}
                                        onClick={(e) => { e.stopPropagation(); rollSpellDamage(spell); }}
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        title="Roll Damage">
                                        <i className="fas fa-dice-d20"></i>
                                        <span className="ms-1 text-truncate">{getFriendlyDiceString(spell.dice, characterStats)}</span>
                                    </button>

                                    {/* Quantity controls with fixed width */}
                                    <div className="input-group input-group-sm" style={{ width: '140px', flexShrink: 0 }}>
                                        <button
                                            className="btn btn-outline-danger btn-sm"
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
                                            className="btn btn-outline-success btn-sm"
                                            onClick={(e) => { e.stopPropagation(); incrementSpellQuantity(spell.id); }}>
                                            <i className="fas fa-plus"></i>
                                        </button>
                                    </div>

                                    {/* Up and down buttons */}
                                    
                                    <div className="btn-group hide-on-small" style={{ flexShrink: 0 }}>
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
                                <br />

                            </div>
                            {expandedSpellId === spell.id && (
                                <div className="mt-3">
                                                                        {/* Badges for spell info */}
                                    <div className="d-flex flex-wrap justify-content-center mb-2" style={{ gap: '0.5rem' }}>
                                        <span
                                            className={`badge bg-dark border text-${spell.isLinked ? STATS_CONFIG[spell.linkedStat].color : 'secondary'}
                                                link-badge-responsive`}
                                            data-bs-toggle="tooltip"
                                            data-bs-original-title=""
                                            title={spell.isLinked ? "Linked to " + STATS_CONFIG[spell.linkedStat].name : 'No linked stat'}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBadgeClick(spell);
                                            }}
                                            style={{
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <i className={`fas ${spell.isLinked ? STATS_CONFIG[spell.linkedStat].icon : 'fa-link-slash'}`}></i>
                                            <span>{spell.isLinked ? (
                                                <>
                                                    {`${STATS_CONFIG[spell.linkedStat].name}`}
                                                    <span className="ms-2">{`+${calculateStatBonus(spell.quantity, spell.rank)}`}</span>
                                                </>
                                            ) : ''}</span>
                                        </span>
                                    
                                        <span className="badge bg-dark border">
                                            <small>{getActionLabel(spell.actions)} {spell.actions} Actions</small>
                                        </span>
                                        <span className="badge bg-dark border">
                                            <small>{getElementIcon(spell.element)} {capitalizeFirstLetter(spell.element)}</small>
                                        </span>
                                        <span className="badge bg-dark border">
                                            <small>Power: {spell.power}</small>
                                        </span>
                                        <span className="badge bg-dark border">
                                            <small>Rank: {spell.rank}</small>
                                        </span>
                                        
                                    </div>

                                    <p className="py-1 border-bottom h5">Description</p>
                                    <div
                                        className="mb-0 spell-description"
                                        style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: '3',
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}
                                        dangerouslySetInnerHTML={{ __html: spell.description }}
                                    />
                                </div>
                            )}
                        </li>
                    ))}
                </ul>

                {/* Edit Spell Entry Modal */}
                <EditSpellEntryModal
                    isModalOpen={isEditModalOpen}
                    closeModal={closeEditModal}
                    spellBeingEdited={spellBeingEdited}
                    currentSpell={currentSpell}
                    setCurrentSpell={setCurrentSpell}
                    incrementPower={incrementPower}
                    decrementPower={decrementPower}
                    getSpellRank={getSpellRank}
                    getActionLabel={getActionLabel}
                    validateDiceRoll={validateDiceString}
                    diceError={diceError}
                    saveSpell={saveSpell}
                    removeSpell={removeSpell}
                />

                <LinkSpellModal
                    isLinkModalOpen={isLinkModalOpen}
                    closeLinkModal={closeLinkModal}
                    currentSpell={currentSpell}
                    setCurrentSpell={setCurrentSpell}
                    saveSpell={saveSpell}
                    getLinkedStats={getLinkedStats}

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