import { useState, useContext, useEffect } from 'preact/hooks';
import { CharacterContext } from '../context/CharacterContext';
import { ElementType, AffinityType, getElementIcon } from '../config/enums';
import './AffinityTracker.scss';

const AffinityTracker = () => {
    const { characterStats, setCharacterStats } = useContext(CharacterContext);
    
    useEffect(() => {
        if (!characterStats.affinities) {
            // Initialize affinities if they don't exist
            const defaultAffinities = {};
            Object.values(ElementType).forEach(element => {
                defaultAffinities[element] = AffinityType.NEUTRAL;
            });
            
            setCharacterStats(prev => ({
                ...prev,
                affinities: defaultAffinities
            }));
        }
    }, []);

    const updateAffinity = (element, affinity) => {
        setCharacterStats(prev => ({
            ...prev,
            affinities: {
                ...prev.affinities,
                [element]: affinity
            }
        }));
    };

    const getAffinityColor = (affinity) => {
        switch (affinity) {
            case AffinityType.WEAK: return 'danger';
            case AffinityType.RESIST: return 'info';
            case AffinityType.IMMUNE: return 'warning';
            case AffinityType.ABSORB: return 'success';
            default: return 'secondary';
        }
    };

    const getAffinityIcon = (affinity) => {
        switch (affinity) {
            case AffinityType.WEAK: return 'fa-triangle-exclamation';
            case AffinityType.RESIST: return 'fa-shield-alt';
            case AffinityType.IMMUNE: return 'fa-ban';
            case AffinityType.ABSORB: return 'fa-heart-circle-plus';
            default: return 'fa-minus';
        }
    };

    if (!characterStats.affinities) return null;

    return (
        <div className="affinity-tracker p-3">
            <h5 className="text-secondary-emphasis mb-4">ELEMENTAL AFFINITIES</h5>
            <div className="element-grid">
                {Object.entries(ElementType).map(([key, element]) => (
                    <div key={key} className="element-item mb-2">
                                                <div className="element-header d-flex align-items-center mb-1">
                            <span className="me-2">{getElementIcon(element)}</span>
                            <span className="element-name">{element}: </span>
                            <span className={`ms-1 text-${getAffinityColor(characterStats.affinities[element])}`}>
                                {characterStats.affinities[element]}
                            </span>
                        </div>
                        <div className="affinity-buttons btn-group d-flex">
                            {Object.values(AffinityType).map(affinity => (
                                <button
                                    key={affinity}
                                    className={`btn btn-sm btn-${
                                        characterStats.affinities[element] === affinity 
                                            ? getAffinityColor(affinity) 
                                            : 'outline-secondary'
                                    }`}
                                    onClick={() => updateAffinity(element, affinity)}
                                    title={affinity}
                                >
                                    <i className={`fas ${getAffinityIcon(affinity)}`}></i>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AffinityTracker;