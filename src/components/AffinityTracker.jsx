import { useState, useContext, useEffect } from 'preact/hooks';
import { CharacterContext } from '../context/CharacterContext';
import { ElementType, AffinityType, getElementIcon } from '../config/enums';
import './AffinityTracker.scss';
import DecorativeTitle from './DecorativeTitle';

const AffinityTracker = () => {
    const { characterStats, setCharacterStats } = useContext(CharacterContext);

    useEffect(() => {
        // Initialize or update affinities structure if it doesn't exist or is in old format
        let needsUpdate = !characterStats.affinities;
        if (characterStats.affinities) {
            const firstElementKey = Object.keys(ElementType)[0];
            if (firstElementKey && characterStats.affinities[ElementType[firstElementKey]] && typeof characterStats.affinities[ElementType[firstElementKey]] !== 'object') {
                // Old format detected (value is string, not object)
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            const defaultAffinities = {};
            Object.values(ElementType).forEach(element => {
                defaultAffinities[element] = {
                    type: AffinityType.NEUTRAL,
                    mastered: false
                };
            });
            setCharacterStats(prev => ({
                ...prev,
                affinities: defaultAffinities
            }));
        }
    }, [characterStats.affinities, setCharacterStats]);

    const updateAffinityType = (element, affinityTypeValue) => {
        setCharacterStats(prev => ({
            ...prev,
            affinities: {
                ...prev.affinities,
                [element]: {
                    ...(prev.affinities?.[element] || { type: AffinityType.NEUTRAL, mastered: false }), // Ensure object exists
                    type: affinityTypeValue
                }
            }
        }));
    };

    const toggleMastery = (element) => {
        setCharacterStats(prev => ({
            ...prev,
            affinities: {
                ...prev.affinities,
                [element]: {
                    ...(prev.affinities?.[element] || { type: AffinityType.NEUTRAL, mastered: false }), // Ensure object exists
                    mastered: !prev.affinities?.[element]?.mastered
                }
            }
        }));
    };

    const getAffinityColor = (affinityTypeValue) => {
        switch (affinityTypeValue) {
            case AffinityType.WEAK: return 'danger';
            case AffinityType.RESIST: return 'info';
            case AffinityType.IMMUNE: return 'warning';
            case AffinityType.ABSORB: return 'success';
            default: return 'secondary';
        }
    };

    const getAffinityIcon = (affinityTypeValue) => {
        switch (affinityTypeValue) {
            case AffinityType.WEAK: return 'fa-triangle-exclamation';
            case AffinityType.RESIST: return 'fa-shield-alt';
            case AffinityType.IMMUNE: return 'fa-ban';
            case AffinityType.ABSORB: return 'fa-heart-circle-plus';
            default: return 'fa-minus';
        }
    };

    // Ensure affinities is initialized and in the new object format
    if (!characterStats.affinities || typeof characterStats.affinities[Object.values(ElementType)[0]] !== 'object') {
        return <div className="p-3">Loading affinities...</div>; // Or some other loading/default state
    }

    return (
        <div className="affinity-tracker p-3">
            <DecorativeTitle title="ELEMENTAL AFFINITIES" />
            <div className="element-grid mt-4">
                {Object.values(ElementType).map((element) => {
                    const currentAffinity = characterStats.affinities[element] || { type: AffinityType.NEUTRAL, mastered: false };
                    return (
                        <div key={element} className="element-item mb-3">
                            <div className="element-header d-flex align-items-center justify-content-between mb-1">
                                <div className="d-flex align-items-center">
                                    <span className="me-2">{getElementIcon(element)}</span>
                                    <span className={`element-name ${currentAffinity.mastered ? 'text-warning fw-bold' : ''}`}>
                                        {element}:
                                    </span>
                                    <span className={`ms-1 text-${getAffinityColor(currentAffinity.type)}`}>
                                        {currentAffinity.type}
                                    </span>
                                </div>
                                <button
                                    className={`btn btn-sm ${currentAffinity.mastered ? 'btn-warning' : 'btn-outline-secondary'}`}
                                    onClick={() => toggleMastery(element)}
                                    title={currentAffinity.mastered ? "Disable Mastery" : "Enable Mastery"}
                                    style={{ lineHeight: 1, minWidth: '30px' }} // Adjust for icon alignment
                                >
                                    <i className={`fas fa-star`}></i>
                                </button>
                            </div>
                            <div className="affinity-buttons btn-group d-flex">
                                {Object.values(AffinityType).map(affinityValue => (
                                    <button
                                        key={affinityValue}
                                        className={`btn btn-sm btn-${currentAffinity.type === affinityValue
                                            ? getAffinityColor(affinityValue)
                                            : 'outline-secondary'
                                            }`}
                                        onClick={() => updateAffinityType(element, affinityValue)}
                                        title={affinityValue}
                                    >
                                        <i className={`fas ${getAffinityIcon(affinityValue)}`}></i>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AffinityTracker;