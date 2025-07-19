import { createContext } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { STATS_CONFIG } from '../config/stats';

export const CharacterContext = createContext({
    characterStats: {},
    setCharacterStats: (value) => {}
});

export function CharacterProvider({ children }) {
    const initializeCharacterStats = () => {
        const savedStats = localStorage.getItem('characterStats');
        if (savedStats) {
            return JSON.parse(savedStats);
        } else {
            const defaultStats = {
                speed: 15,
                AC: 10,
                maxHealth: 35,
                maxMp: 1,
                currentHealth: 35,
                currentMp: 1
            };
            for (const statKey in STATS_CONFIG) {
                defaultStats[statKey] = STATS_CONFIG[statKey].defaultValue || 0;
            }
            return defaultStats;
        }
    };

    const [characterStats, setCharacterStats] = useState(initializeCharacterStats);

    useEffect(() => {
        localStorage.setItem('characterStats', JSON.stringify(characterStats));
    }, [characterStats]);

    const value = {
        characterStats,
        setCharacterStats
    };

    return (
        <CharacterContext.Provider value={value}>
            {children}
        </CharacterContext.Provider>
    );
}