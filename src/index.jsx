import { render } from 'preact';
import { LocationProvider, Router, Route } from 'preact-iso';
import { CharacterProvider } from './context/CharacterContext';

import { Header } from './components/Header.jsx';
import { SpellInventory } from './pages/SpellInventory/index.jsx';
import { NotFound } from './pages/_404.jsx';
import './style.css';
import { Stats } from './pages/StatsPage';

export function App() {
    return (
        <CharacterProvider>
            <LocationProvider>
                <Header />
                <main>
                    <Router>
                        <Route path="/" component={Stats} />
                        <Route path="/spells" component={SpellInventory} />
                        <Route default component={NotFound} />
                    </Router>
                </main>
            </LocationProvider>
        </CharacterProvider>
    );
}

render(<App />, document.getElementById('app'));
