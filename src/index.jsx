import { render } from 'preact';
import { NotFound } from './pages/_404.jsx';
import { LocationProvider, Router, Route, useLocation } from 'preact-iso';
import { CharacterProvider } from './context/CharacterContext';
import { SpellProvider } from './context/SpellContext';

import './style.scss';
import '@fortawesome/fontawesome-free/scss/solid.scss';
import { CharacterSheet } from './pages/CharacterSheet/index.jsx';
import { SpellsPage } from './pages/SpellInventory/index.jsx';
import { Header } from './components/Header.jsx';
import { BASE_URL } from './config/constants.js';

export function App() {
    return (
        <CharacterProvider>
            <SpellProvider>
                <LocationProvider>
                    <Header />
                    <main>
                        <Router>
                            <Route path={BASE_URL} component={CharacterSheet} />
                            <Route path={`${BASE_URL}spells`} component={SpellsPage} />
                            <Route default component={NotFound} />
                        </Router>
                    </main>
                </LocationProvider>
            </SpellProvider>
            {BUILD_DATE}
        </CharacterProvider>
    );
}

render(<App />, document.getElementById('app'));