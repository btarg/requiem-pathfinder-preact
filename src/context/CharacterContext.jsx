import { createContext } from 'preact';
import { useState, useEffect } from 'preact/hooks';


export const CharacterContext = createContext({
    characterStats: {},
    setCharacterStats: (value) => {}
});

export function CharacterProvider({ children }) {
    const [characterStats, setCharacterStats] = useState(() => {
        const savedStats = localStorage.getItem('characterStats');
        return savedStats ? JSON.parse(savedStats) : {};
    });

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