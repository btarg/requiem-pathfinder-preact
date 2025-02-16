import { createContext } from 'preact';
import { useContext, useState, useEffect } from 'preact/hooks';

const SpellContext = createContext({
    spells: [],
    setSpells: (value) => {},
    getLinkedStats: () => [],
    subscribe: (callback) => {},
    unsubscribe: (callback) => {}
});

export const SpellProvider = ({ children }) => {
    const [spells, setSpells] = useState(() => {
        const savedSpells = localStorage.getItem('spells');
        return savedSpells ? JSON.parse(savedSpells) : [];
    });

    const [subscribers, setSubscribers] = useState([]);

    useEffect(() => {
        localStorage.setItem('spells', JSON.stringify(spells));
        subscribers.forEach(callback => callback(spells));
    }, [spells]);

    const getLinkedStats = () => {
        return spells.filter(spell => spell.isLinked).map(spell => spell.linkedStat);
    };

    const subscribe = (callback) => {
        setSubscribers(prev => [...prev, callback]);
    };

    const unsubscribe = (callback) => {
        setSubscribers(prev => prev.filter(sub => sub !== callback));
    };

    return (
        <SpellContext.Provider value={{ spells, setSpells, getLinkedStats, subscribe, unsubscribe }}>
            {children}
        </SpellContext.Provider>
    );
};

export const useSpellContext = () => useContext(SpellContext);