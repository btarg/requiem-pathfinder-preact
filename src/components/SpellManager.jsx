import { useState, useEffect, useContext } from "preact/hooks";
import { Tooltip } from 'bootstrap';
import { CharacterContext } from "../context/CharacterContext";
import { calculateStatBonus, getLinkStatBonus, replaceDiceStats, validateDiceRoll, validateSpellFields } from "../utils/diceHelpers";
import { getSpellRank, STATS_CONFIG } from "../config/stats";
import { ElementType, getElementIcon } from "../config/enums";
import { useSpellContext } from "../context/SpellContext";
import DeleteSpellModal from "./modals/DeleteSpellModal";
import EditSpellEntryModal from "./modals/EditSpellEntryModal";
import LinkSpellModal from "./modals/LinkSpellModal";
import ToastManager from "./ToastManager";
import { MAX_DRAW_LUCK_BONUS, MAX_SPELL_STACKS } from "../config/constants";
import DecorativeTitle from "./DecorativeTitle";

const SpellManager = () => {
    const { characterStats, setCharacterStats } = useContext(CharacterContext);
    const { spells, setSpells, getLinkedStats } = useSpellContext();
    const { showToast } = ToastManager();

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
        element: ElementType.PHYS
    };

    const [currentSpell, setCurrentSpell] = useState(defaultSpell);
    const [spellBeingEdited, setSpellBeingEdited] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

    const [expandedSpellId, setExpandedSpellId] = useState(null);
    const [drawMasteryEnabled, setDrawMasteryEnabled] = useState(false); // State for the mastery toggle

    const handleDrawMasteryToggle = (e) => {
        setDrawMasteryEnabled(e.target.checked);
    };

    const spellIsMastered = (spellToDraw) => {
        if (!spellToDraw) {
            return false;
        }
        return characterStats.affinities?.[spellToDraw.element]?.mastered || false
    }

    const handleRollToDrawSpecificSpell = (spellToDraw) => {
        if (!spellToDraw) {
            return;
        }
        handleRollToDraw(spellIsMastered(spellToDraw));
    }
    // Why is this even necessary?
    const handleRollToDrawButton = () => {
        handleRollToDraw(drawMasteryEnabled);
    };

    const handleRollToDraw = (hasMastery) => {

        const originalLuckValue = characterStats.luck + getLinkStatBonus(spells, "luck") || 0;
        const luckValue = Math.min(originalLuckValue, MAX_DRAW_LUCK_BONUS);

        var luckString = `🍀 Luck=[[${originalLuckValue}`;
        if (originalLuckValue > MAX_DRAW_LUCK_BONUS) {
            luckString += `]] (+${MAX_DRAW_LUCK_BONUS} max bonus)`;
        } else {
            luckString += `]]`;
        }

        const diceCount = hasMastery ? 2 : 1;
        const rollFormula = `${diceCount}d6cf1 + ${luckValue}[Luck Bonus]`;
        const drawTitle = hasMastery ? "Draw Spell (Mastery)" : "Draw Spell";

        const command = `&{template:default} {{name=${drawTitle}}} {{Charges Gained=[[${rollFormula}]]}} {{${luckString}}} {{Note=If the number is highlighted red, the true amount of Charges Gained is that total MINUS the Luck Bonus.}}`;

        navigator.clipboard.writeText(command)
            .then(() => {
                showToast(`${drawTitle} command copied! Paste it into Roll20.`, 'clipboard', 'success', 'Copied to clipboard');
            })
            .catch(err => {
                console.error('Failed to copy command: ', err);
                showToast('Failed to copy command.', 'exclamation-triangle', 'danger', 'Copy Error');
            });
    };

    const rollSpellDamage = (spell) => {
        if (spell.quantity > 0 && spell.dice) {
            try {
                const diceWithStats = replaceDiceStats(spells, spell.dice, characterStats);
                const elementIcon = getElementIcon(spell.element);
                // STR is used for the attack roll now, not the damage roll
                const attackRoll = replaceDiceStats(spells, "1d20+[strength]", characterStats);

                let actionText;
                if (spell.actions === 0) {
                    actionText = "Free Action";
                } else {
                    actionText = spell.actions === 1 ? "Action" : "Actions";
                }

                const rollCommand = `&{template:default} {{name=${spell.name}}} \
                                {{Actions=${spell.actions} ${actionText}}} \
                                {{Level=**Spell ${spell.power}** (S.Link Rank ${spell.rank})}} \
                                {{Attack=[[${attackRoll}]]}} \
                                {{Damage=[[${diceWithStats}]] ${elementIcon} ${spell.element}}} \
                                ${spell.description ? `{{Description=${spell.description}}}
                                ` : ''}`;

                navigator.clipboard.writeText(rollCommand);
                showToast("Spell roll command copied! Paste it into the text chat on Roll20.", 'clipboard', 'success', 'Copied to clipboard');
                updateSpell(spell.id, "quantity", spell.quantity - 1);
            } catch (error) {
                alert(error.message || "Invalid dice format!");
            }
        } else {
            showToast("No more charges of this spell remaining!", 'exclamation-triangle', 'warning', 'Cannot cast spell');
        }
    };

    const notifySpellQuantityChange = (spell, newQuantity, oldQuantity) => {
        const change = newQuantity - oldQuantity;
        const message = `${spell.name}: ${oldQuantity} → ${newQuantity} (${change >= 0 ? '+' : ''}${change})`;
        console.log(message);
    };

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

    const [flashingSpellId, setFlashingSpellId] = useState(null);

    const updateSpell = (id, key, value) => {
        const spell = spells.find(s => s.id === id);
        if (spell) {
            if (key === "quantity" && spell.quantity !== value) {
                setFlashingSpellId(id);
                setTimeout(() => setFlashingSpellId(null), 300); // Reset after 300ms
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
        const newQuantity = Math.min(MAX_SPELL_STACKS, spell.quantity + incrementAmount);
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

    const getLinkedSpellString = (spell) => {
        return spell.isLinked ? "Linked to " + STATS_CONFIG[spell.linkedStat].name : 'No linked stat';
    }

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
                <DecorativeTitle title="SPELL INVENTORY" lineMaxWidth="50px" />
                <div className="d-flex align-items-center justify-content-center mb-4">
                    <div className="form-check form-switch me-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="drawMasteryToggle"
                            checked={drawMasteryEnabled}
                            onChange={handleDrawMasteryToggle} // Using extracted handler
                            style={{ cursor: 'pointer' }}
                        />
                        <label className="form-check-label text-light" htmlFor="drawMasteryToggle" style={{ cursor: 'pointer' }}>
                            Mastery
                        </label>
                    </div>
                <button className="dark-btn dark-btn-secondary me-2" onClick={handleRollToDrawButton}>
                    <i className="fas fa-dice me-2"></i> <span>Roll to Draw</span>
                </button>
                <button className="dark-btn dark-btn-primary" onClick={() => openEditModal()}>
                    <i className="fas fa-plus me-2"></i> <span>Add Spell</span>
                </button>
                </div>
                
                {/* Spell list */}
                <ul className="list-group">
                    {spells.map((spell, index) => (
                        <li key={spell.id} className={`list-group-item spell-item ${flashingSpellId === spell.id ? 'quantity-flash' : ''}`}>
                            <div class="d-flex justify-content-left">
                                <div className="d-flex align-items-center overflow-hidden" style={{ flex: '1 1 0' }}
                                    onClick={() => toggleExpandSpell(spell.id)}>
                                    <span
                                        id={`quantity-badge-${spell.id}`}
                                        className="text-black badge quantity-badge me-2"
                                        style={{ width: '2.5rem', flexShrink: 0 }}
                                    >
                                        <small>{spell.quantity}</small>
                                    </span>
                                    {/* Action Label and name */}
                                    <div class="text-truncate">
                                        {getElementIcon(spell.element)} <span className="arsenal me-2">{spell.name}</span>

                                        <span className="action-label hide-on-small me-2" style={{
                                            width: window.innerWidth <= 750 ? '0px' : '50px',
                                        }}>
                                            {getActionLabel(spell.actions)}
                                        </span>
                                        
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
                                        data-bs-original-title={getLinkedSpellString(spell)}
                                        title={getLinkedSpellString(spell)}
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

                                    {/* Roll button */}
                                    <button className="btn btn-outline-danger btn-sm roll-button"
                                        style={{ width: '120px', whiteSpace: 'nowrap', overflow: 'hidden' }}
                                        onClick={(e) => { e.stopPropagation(); rollSpellDamage(spell); }}
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        title="Click to copy roll command">
                                        <i className="fas fa-dice-d20"></i>
                                        <span className="ms-1 text-truncate">{replaceDiceStats(spells, spell.dice, characterStats, true)}</span>
                                    </button>

                                    {/* Draw Charges Button */}
                                    <button
                                        className="btn btn-outline-info btn-sm"
                                        onClick={(e) => { e.stopPropagation(); handleRollToDrawSpecificSpell(spell); }}
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        title={`Click to copy the Draw command for ${spell.name} (${spell.element} - ${spellIsMastered(spell) ? "mastery" : "normal"})`}
                                        style={{ flexShrink: 0 }}
                                    >
                                        <i className="fas fa-hand-sparkles"></i>
                                        <span className="ms-1 hide-when-small">Draw</span>
                                    </button>

                                    {/* Quantity controls */}
                                    <div className="input-group input-group-sm">
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
                                            min="1" // Add min attribute
                                            max={MAX_SPELL_STACKS} // Add max attribute, using MAX_SPELL_STACKS
                                            onChange={(e) => setIncrementAmount(Math.max(1, Math.min(MAX_SPELL_STACKS, parseInt(e.currentTarget.value) || 1)))} // Cap upper limit with MAX_SPELL_STACKS
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
                                            data-bs-original-title={getLinkedSpellString(spell)}
                                            title={getLinkedSpellString(spell)}
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
                                            {getActionLabel(spell.actions)} {spell.actions} Actions
                                        </span>
                                        <span className="badge bg-dark border">
                                            {getElementIcon(spell.element)} {spell.element}
                                        </span>
                                        <span className="badge bg-dark border">
                                            Spell {spell.power} <i>(SL. Rank: {spell.rank})</i>
                                        </span>

                                    </div>

                                    {spell.description && (
                                        <>
                                            <p className="py-1 border-bottom h5 arsenal">Description</p>
                                            <div
                                                className="mb-0 spell-description arsenal"
                                                style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: '5',
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}
                                                dangerouslySetInnerHTML={{ __html: spell.description }}
                                            />
                                        </>
                                    )}
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