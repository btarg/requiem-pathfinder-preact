import { createContext } from 'preact';
import { useContext, useState, useEffect } from 'preact/hooks';

const AbilityContext = createContext({
    abilities: [],
    setAbilities: (value) => { },
    subscribe: (callback) => { },
    unsubscribe: (callback) => { }
});

export const AbilityProvider = ({ children }) => {
    const [abilities, setAbilities] = useState(() => {
        try {
            const savedAbilities = localStorage.getItem('abilities');
            return savedAbilities ? JSON.parse(savedAbilities) : [];
        } catch (error) {
            console.error('Error loading abilities from localStorage:', error);
            return [];
        }
    });

    const [subscribers, setSubscribers] = useState([]);    useEffect(() => {
        console.log('Saving abilities to localStorage:', abilities);
        localStorage.setItem('abilities', JSON.stringify(abilities));
        subscribers.forEach(callback => callback(abilities));
    }, [abilities, subscribers]);

    const subscribe = (callback) => {
        setSubscribers(prev => [...prev, callback]);
    };

    const unsubscribe = (callback) => {
        setSubscribers(prev => prev.filter(sub => sub !== callback));
    };

    return (
        <AbilityContext.Provider value={{ abilities, setAbilities, subscribe, unsubscribe }}>
            {children}
        </AbilityContext.Provider>
    );
};

export const useAbilityContext = () => useContext(AbilityContext);