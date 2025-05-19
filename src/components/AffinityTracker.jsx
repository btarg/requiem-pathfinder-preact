import { useContext, useEffect, useState } from 'preact/hooks';
import { CharacterContext } from '../context/CharacterContext';
import { ElementType, AffinityType, getElementIcon } from '../config/enums';
import './AffinityTracker.scss';
import DecorativeTitle from './DecorativeTitle';
import reflectIconSvg from '../assets/shield-reflect.svg'; // Import reflect SVG
// import reflectIconSvg from '../assets/divert.svg';

import weakIconSvg from '../assets/achilles-heel.svg'; // Import weak SVG
import healIconSvg from '../assets/heart-plus.svg'; // Import heal SVG for Absorb

const AffinityTracker = () => {
    const { characterStats, setCharacterStats } = useContext(CharacterContext);
    const [editingElement, setEditingElement] = useState(null); // State to track which element is being edited

    useEffect(() => {
        // Initialize or update affinities structure if it doesn't exist or is in old format
        let needsUpdate = !characterStats.affinities;
        if (characterStats.affinities) {
            const firstElementKey = Object.keys(ElementType)[0];
            // Check if the first element's affinity is not an object (old format)
            if (firstElementKey &&
                characterStats.affinities[ElementType[firstElementKey]] &&
                typeof characterStats.affinities[ElementType[firstElementKey]] !== 'object') {
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

    const handleElementClick = (element) => {
        setEditingElement(prev => prev === element ? null : element); // Toggle or switch editing element
    };

    const updateAffinityType = (element, affinityTypeValue) => {
        setCharacterStats(prev => ({
            ...prev,
            affinities: {
                ...prev.affinities,
                [element]: {
                    ...(prev.affinities?.[element] || { type: AffinityType.NEUTRAL, mastered: false }),
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
                    ...(prev.affinities?.[element] || { type: AffinityType.NEUTRAL, mastered: false }),
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
            case AffinityType.REFLECT: return 'primary';
            default: return 'secondary'; // NEUTRAL
        }
    };

    const getAffinityIcon = (affinityTypeValue) => {
        const iconStyle = {
            width: '1.25em',
            height: '1.25em',
            color: "white",
        };

        switch (affinityTypeValue) {
            case AffinityType.WEAK:
                return <img src={weakIconSvg} alt="Weak" style={iconStyle} />;
            case AffinityType.RESIST:
                return <i className="fas fa-shield-alt" style={iconStyle}></i>;
            case AffinityType.IMMUNE:
                return <i className="fas fa-ban" style={iconStyle}></i>;
            case AffinityType.ABSORB:
                return <img src={healIconSvg} alt="Absorb" style={iconStyle} />;
            case AffinityType.REFLECT:
                return <img src={reflectIconSvg} alt="Reflect" style={iconStyle} />;
            default: // NEUTRAL
                return <i className="fas fa-minus" style={iconStyle}></i>;
        }
    };

    if (!characterStats.affinities || typeof characterStats.affinities[Object.values(ElementType)[0]] !== 'object') {
        return <div className="p-3">Loading affinities...</div>;
    }

    return (
        <div className="affinity-tracker p-3">
            <DecorativeTitle title="ELEMENTAL AFFINITIES" />
            <div className="element-grid mt-4 gap-1">
                {Object.values(ElementType)
                    .filter(element => element !== "Almighty")
                    .map((element) => {
                    const currentAffinity = characterStats.affinities[element] || { type: AffinityType.NEUTRAL, mastered: false };
                    return (
                        <div 
                            key={element} 
                            className={`element-item clickable-card mb-3 ${currentAffinity.mastered ? 'gold-bg' : ''} ${editingElement === element ? 'editing' : ''}`}
                            onClick={() => handleElementClick(element)} // Add click handler to the item
                        >
                            {currentAffinity.mastered && (
                                <div className="mastery-watermark">MASTERY</div>
                            )}
                            <div className="element-header d-flex align-items-center justify-content-between mb-1">
                                <div className="d-flex align-items-center">
                                    
                                    <span className="element-name">
                                        {getElementIcon(element)} <span className="arsenal">{element}:</span>
                                    </span>
                                    <span className={`arsenal ms-1 text-${getAffinityColor(currentAffinity.type)}`}>
                                        {currentAffinity.type}
                                    </span>
                                </div>
                                <button
                                    className={`mastery-toggle-button ${currentAffinity.mastered ? 'mastered' : ''}`}
                                    onClick={(e) => { 
                                        e.stopPropagation(); // Prevent click from bubbling to element-item
                                        toggleMastery(element);
                                    }}
                                    title={currentAffinity.mastered ? "Disable Mastery" : "Enable Mastery"}
                                >
                                    <i className={`${currentAffinity.mastered ? 'fas fa-star' : 'fa-regular fa-star'}`}></i>
                                </button>
                            </div>
                            {editingElement === element && ( // Conditionally render buttons
                                <div className="affinity-buttons btn-group d-flex flex-wrap mt-2">
                                    {Object.values(AffinityType).map(affinityValue => (
                                        <button
                                            key={affinityValue}
                                            className={`btn btn-${currentAffinity.type === affinityValue
                                                ? getAffinityColor(affinityValue)
                                                : 'dark inactive-btn'
                                                }`}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent click from bubbling to element-item
                                                updateAffinityType(element, affinityValue);
                                            }}
                                            title={affinityValue}
                                        >
                                            {getAffinityIcon(affinityValue)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AffinityTracker;