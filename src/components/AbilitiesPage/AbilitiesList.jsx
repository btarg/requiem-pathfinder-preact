import { useState, useContext, useEffect } from 'preact/hooks';
import { Tooltip } from 'bootstrap';
import { useAbilityContext } from '../../context/AbilityContext';
import { CharacterContext } from '../../context/CharacterContext';
import { calculateStatBonus, replaceDiceStats, validateDiceRoll } from '../../utils/diceHelpers';
import { AbilityType, getElementIcon } from '../../config/enums';
import ToastManager from '../ToastManager';
import EditAbilityEntryModal from '../modals/EditAbilityEntryModal';
import DeleteAbilityModal from '../modals/DeleteAbilityModal';
import DecorativeTitle from '../DecorativeTitle';
import './AbilitiesList.scss';

const AbilitiesList = () => {
    const { abilities, setAbilities } = useAbilityContext();
    const { characterStats } = useContext(CharacterContext);
    const { showToast } = ToastManager();

    const defaultAbility = {
        id: null,
        name: "",
        type: AbilityType.GENERIC,
        description: "",
        dice: "",
        actions: 1,
        element: "Physical",
        additionalAttacks: []
    };

    const [expandedAbilityId, setExpandedAbilityId] = useState(null);
    const [currentAbility, setCurrentAbility] = useState(defaultAbility);
    const [abilityBeingEdited, setAbilityBeingEdited] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [abilityToDelete, setAbilityToDelete] = useState(null);

    const [diceError, setDiceError] = useState("");
    const [flashingAbilityId, setFlashingAbilityId] = useState(null);

    useEffect(() => {
        console.log('Saving abilities to localStorage:', abilities);
        localStorage.setItem('abilities', JSON.stringify(abilities));
    }, [abilities]);

    useEffect(() => {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new Tooltip(tooltipTriggerEl));

        return () => {
            tooltipList.forEach(tooltip => {
                if (tooltip && typeof tooltip.dispose === 'function') {
                    tooltip.dispose();
                }
            });
        };
    }, []);

    const toggleExpandAbility = (id) => {
        setExpandedAbilityId(expandedAbilityId === id ? null : id);
    };

    const openEditModal = (ability = null) => {
        setAbilityBeingEdited(ability);
        setCurrentAbility(ability || defaultAbility);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setAbilityBeingEdited(null);
        setIsEditModalOpen(false);
        setDiceError("");
    };

    const removeAbility = (id) => {
        setAbilityToDelete(id);
    };

    const confirmDelete = () => {
        if (abilityToDelete) {
            const abilityToRemove = abilities.find(s => s.id === abilityToDelete);
            setAbilities(abilities.filter(ability => ability.id !== abilityToDelete));
            setAbilityToDelete(null);
            closeEditModal();
            showToast(`${abilityToRemove.name} deleted successfully`, 'trash', 'danger', 'Deleted');
        }
    };

    const validateDiceString = (diceString) => {
        if (!diceString) return true; // Allow empty dice strings
        const result = validateDiceRoll(diceString, characterStats);
        setDiceError(result.error || "");
        return result.isValid;
    };

    const saveAbility = () => {
        // Check minimal validation
        if (!currentAbility.name.trim()) {
            setDiceError("Name is required");
            return;
        }

        if (currentAbility.type?.toString() === AbilityType.WEAPON.toString() && !currentAbility.dice.trim()) {
            setDiceError("Attack roll is required for weapons");
            return;
        }

        if (currentAbility.dice && !validateDiceString(currentAbility.dice)) {
            return; // Error is already set by validateDiceString
        }        // Save the ability
        if (abilityBeingEdited) {
            setAbilities(abilities.map(ability =>
                ability.id === abilityBeingEdited.id ?
                    { ...currentAbility, id: abilityBeingEdited.id } :
                    ability
            ));
            showToast(`${currentAbility.name} updated successfully`, 'check', 'success', 'Updated');
            setFlashingAbilityId(abilityBeingEdited.id);
        } else {
            // Ensure a new ID is generated
            const newAbility = {
                ...currentAbility,
                id: Date.now() // Use timestamp as ID
            };
            setAbilities(prevAbilities => [...prevAbilities, newAbility]);
            showToast(`${currentAbility.name} added successfully`, 'plus', 'success', 'Added');
            setFlashingAbilityId(newAbility.id);
        }

        setTimeout(() => setFlashingAbilityId(null), 1000);

        console.log("Ability saved:", currentAbility);
        closeEditModal();
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
            case 4:
                label = "[reaction]";
                title = "Reaction";
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

    const handleRollAbility = (ability) => {
        if (ability.type === AbilityType.WEAPON) {
            rollWeaponAttack(ability);
        } else {
            rollGenericAbility(ability);
        }
    };

    const rollWeaponAttack = (weapon, attackIndex = 0) => {
        // Get base attack roll
        const baseDice = weapon.dice;

        // Perform dice validation
        const { isValid, error } = validateDiceRoll(baseDice, characterStats);
        if (!isValid) {
            showToast(error, 'exclamation-triangle', 'danger', 'Invalid Dice');
            return;
        }

        // Replace stats in dice string with actual values
        const replacedDice = replaceDiceStats([], baseDice, characterStats);
        const attackName = weapon.name;
        let diceRoll = replacedDice;

        // If it's not the first attack, apply the modifier
        if (attackIndex > 0 && weapon.additionalAttacks && weapon.additionalAttacks[attackIndex - 1]) {
            const penalty = weapon.additionalAttacks[attackIndex - 1].penalty || 0;
            if (penalty !== 0) {
                diceRoll = `${replacedDice}${penalty < 0 ? penalty : `+${penalty}`}`;
            }
        }

        // Create attack roll with appropriate attack number
        const attackCommand = `{{Attack ${attackIndex > 0 ? attackIndex + 1 : ''}=[[${diceRoll}]]}}`;

        // Element and damage type info if specified
        let elementInfo = '';
        if (weapon.element) {
            const elementIcon = getElementIcon(weapon.element);
            elementInfo = `{{Element=${elementIcon} ${weapon.element}}}`;
        }

        // Create the full roll command
        const command = `&{template:default} {{name=${attackName}}} ${attackCommand} ${elementInfo} {{Description=${weapon.description || ''}}}`;

        navigator.clipboard.writeText(command)
            .then(() => {
                const attackLabel = attackIndex > 0 ? ` (Attack #${attackIndex + 1})` : '';
                showToast(`${attackName}${attackLabel} command copied! Paste it into Roll20.`, 'clipboard', 'success', 'Copied to clipboard');
            })
            .catch(err => {
                console.error('Failed to copy command: ', err);
                showToast('Failed to copy command.', 'exclamation-triangle', 'danger', 'Copy Error');
            });
    };

    const rollGenericAbility = (ability) => {
        // For abilities that might have dice rolls
        let diceSection = '';
        if (ability.dice) {
            const { isValid, error } = validateDiceRoll(ability.dice, characterStats);
            if (!isValid) {
                showToast(error, 'exclamation-triangle', 'danger', 'Invalid Dice');
                return;
            }

            const replacedDice = replaceDiceStats([], ability.dice, characterStats);
            diceSection = `{{Roll=[[${replacedDice}]]}}`;
        }

        // Create command
        const command = `&{template:default} {{name=${ability.name}}} ${diceSection} {{Description=${ability.description || ''}}}`;

        navigator.clipboard.writeText(command)
            .then(() => {
                showToast(`${ability.name} command copied! Paste it into Roll20.`, 'clipboard', 'success', 'Copied to clipboard');
            })
            .catch(err => {
                console.error('Failed to copy command: ', err);
                showToast('Failed to copy command.', 'exclamation-triangle', 'danger', 'Copy Error');
            });
    };

    // Filter abilities by type
    const weapons = abilities.filter(ability => ability.type?.toString() === AbilityType.WEAPON.toString());
    const genericAbilities = abilities.filter(ability => ability.type?.toString() === AbilityType.GENERIC.toString());

    const renderWeaponItem = (weapon) => (
        <li key={weapon.id} className={`list-group-item ${flashingAbilityId === weapon.id ? 'quantity-flash' : ''}`}>
            <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center overflow-hidden" style={{ flex: '1 1 0' }}
                    onClick={() => toggleExpandAbility(weapon.id)}>
                    <span className="me-2">
                        {getElementIcon(weapon.element)}
                    </span>
                    <div className="text-truncate">
                        <span className="arsenal me-2">{weapon.name}</span>
                        <span className="action-label hide-on-small me-2">
                            {getActionLabel(weapon.actions)}
                        </span>
                    </div>
                </div>

                <div className="d-flex align-items-center justify-content-center" style={{ gap: '0.5rem' }}>                    {/* Edit button */}
                    <i className="fas fa-edit text-primary"
                        onClick={(e) => { e.stopPropagation(); openEditModal(weapon); }}
                        style={{ cursor: 'pointer', transition: 'opacity 0.3s', opacity: 0.6, flexShrink: 0 }}
                        onMouseOver={(e) => { e.stopPropagation(); e.currentTarget.style.opacity = "1" }}
                        onMouseOut={(e) => { e.stopPropagation(); e.currentTarget.style.opacity = "0.6" }}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Edit Weapon"
                    />

                    {/* Attacks with button group */}
                    <div className="btn-group d-flex justify-content-center">
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => rollWeaponAttack(weapon, 0)}
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="Roll base attack"
                        >
                            <i className="fas fa-dice-d20 me-1"></i>
                            <span className="ms-1 text-truncate">{replaceDiceStats(weapons, weapon.dice, characterStats, true)}</span>
                        </button>                        {weapon.additionalAttacks.map((attack, idx) => (
                            <button
                                key={idx}
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => rollWeaponAttack(weapon, idx + 1)}
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title={`Roll attack #${idx + 2} (${attack.penalty < 0 ? attack.penalty : `+${attack.penalty}`})`}
                            >
                                #{idx + 2} ({attack.penalty < 0 ? attack.penalty : `+${attack.penalty}`})
                            </button>
                        ))}
                    </div>

                </div>
            </div>

            {/* Expanded details */}
            {expandedAbilityId === weapon.id && (
                <div className="ability-details mt-2">
                    {/* Badges for weapon info */}                    <div className="d-flex flex-wrap mb-2 justify-content-center gap-1">
                        {weapon.element && (
                            <span className="badge bg-dark border"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                  title={`${weapon.element} damage type`}>
                                {getElementIcon(weapon.element)} {weapon.element}
                            </span>
                        )}
                        <span className="badge bg-dark border"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              title={`Takes ${weapon.actions} action${weapon.actions !== 1 ? 's' : ''} to use`}>
                            {getActionLabel(weapon.actions)} {weapon.actions === 4 ? 'Reaction' : `${weapon.actions} Action${weapon.actions !== 1 ? 's' : ''}`}
                        </span>
                        {weapon.additionalAttacks && weapon.additionalAttacks.length > 0 && (
                            <span className="badge bg-dark border"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                  title={`Can make ${weapon.additionalAttacks.length + 1} attacks in total`}>
                                <i className="fas fa-crosshairs"></i> {weapon.additionalAttacks.length + 1} Attacks
                            </span>
                        )}
                    </div>

                    {weapon.description && (
                        <div>
                            <p className="py-1 border-bottom h6 arsenal text-center">Description</p>
                            <p className="mb-2">{weapon.description}</p>
                        </div>
                    )}
                </div>
            )}
        </li>
    );

    const renderGenericAbilityItem = (ability) => (
        <li key={ability.id} className={`list-group-item ${flashingAbilityId === ability.id ? 'quantity-flash' : ''}`}>
            <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center overflow-hidden" style={{ flex: '1 1 0' }}
                    onClick={() => toggleExpandAbility(ability.id)}>

                    <span className="me-2">
                        {getElementIcon(ability.element)}
                    </span>

                    <div className="text-truncate">
                        <span className="arsenal me-2">{ability.name}</span>
                        <span className="action-label hide-on-small me-2">
                            {getActionLabel(ability.actions)}
                        </span>
                    </div>
                </div>

                <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>

                    {/* Edit button */}
                    <i className="fas fa-edit text-primary"
                        onClick={(e) => { e.stopPropagation(); openEditModal(ability); }}
                        style={{ cursor: 'pointer', transition: 'opacity 0.3s', opacity: 0.6, flexShrink: 0 }}
                        onMouseOver={(e) => { e.stopPropagation(); e.currentTarget.style.opacity = "1" }}
                        onMouseOut={(e) => { e.stopPropagation(); e.currentTarget.style.opacity = "0.6" }}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Edit Ability"
                    />

                    {ability.dice && (
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRollAbility(ability);
                            }}
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="Roll this ability"
                        >
                            <i className="fas fa-dice-d20 me-1"></i>
                            <span className="text-truncate">{ability.dice}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Expanded details */}
            {expandedAbilityId === ability.id && (
                <div className="ability-details mt-2">
                    {/* Badges for ability info */}                    <div className="d-flex flex-wrap mb-2 justify-content-center gap-1">
                        <span className="badge bg-dark border"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              title={`Takes ${ability.actions} action${ability.actions !== 1 ? 's' : ''} to use`}>
                            {getActionLabel(ability.actions)} {ability.actions === 4 ? 'Reaction' : `${ability.actions} Action${ability.actions !== 1 ? 's' : ''}`}
                        </span>
                        {ability.element && (
                            <span className="badge bg-dark border"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                  title={`${ability.element} element type`}>
                                {getElementIcon(ability.element)} {ability.element}
                            </span>
                        )}
                        {ability.dice && (
                            <span className="badge bg-dark border"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                  title="Dice formula for this ability">
                                <i className="fas fa-dice-d20"></i> {ability.dice}
                            </span>
                        )}
                    </div>

                    {ability.description && (
                        <div>
                            <p className="py-1 border-bottom h6 arsenal">Description</p>
                            <p className="mb-0">{ability.description}</p>
                        </div>
                    )}
                </div>
            )}
        </li>
    );

    return (
        <div className="abilities-list-container">
            <DecorativeTitle title="ABILITIES & ATTACKS" />
            <div className="d-flex flex-column justify-content-between align-items-center mb-4">
                <button
                    className="dark-btn dark-btn-primary mt-2 mt-md-0"
                    onClick={() => openEditModal()}
                    style={{ width: '160px', height: '60px' }}
                    data-bs-toggle="tooltip"
                    data-bs-placement="bottom"
                    title="Create a new ability or weapon"
                >
                    <i className="fas fa-plus me-2"></i> <span>Add Ability</span>
                </button>
            </div>

            {/* Two-column layout */}
            <div className="row">
                {/* Weapons Column */}
                <div className="col-12 col-md-6 mb-3">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="arsenal m-0">Attacks</h5>
                        </div>
                        <div className="card-body p-0">
                            {weapons.length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {weapons.map(weapon => renderWeaponItem(weapon))}
                                </ul>
                            ) : (
                                <div className="text-center p-4">
                                    <p className="arsenal mb-0">No weapons found. Click "Add Ability" to create one.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Generic Abilities Column */}
                <div className="col-12 col-md-6 mb-3">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="arsenal m-0">Generic Abilities</h5>
                        </div>
                        <div className="card-body p-0">
                            {genericAbilities.length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {genericAbilities.map(ability => renderGenericAbilityItem(ability))}
                                </ul>
                            ) : (
                                <div className="text-center p-4">
                                    <p className="arsenal mb-0">No abilities found. Click "Add Ability" to create one.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <EditAbilityEntryModal
                isModalOpen={isEditModalOpen}
                closeModal={closeEditModal}
                abilityBeingEdited={abilityBeingEdited}
                currentAbility={currentAbility}
                setCurrentAbility={setCurrentAbility}
                getActionLabel={getActionLabel}
                validateDiceRoll={validateDiceString}
                diceError={diceError}
                saveAbility={saveAbility}
                removeAbility={removeAbility}
            />

            <DeleteAbilityModal
                abilityToDelete={abilityToDelete}
                confirmDelete={confirmDelete}
                setAbilityToDelete={setAbilityToDelete}
            />
        </div>
    );
};

export default AbilitiesList;
