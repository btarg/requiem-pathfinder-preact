import { render } from 'preact';
import { NotFound } from './pages/_404.jsx';
import { LocationProvider, Router, Route } from 'preact-iso';
import { CharacterProvider } from './context/CharacterContext';
import { SpellProvider } from './context/SpellContext';

import './style.scss';
import '@fortawesome/fontawesome-free/scss/solid.scss';
import '@fortawesome/fontawesome-free/scss/brands.scss'; // Import brands for GitHub icon
import { CharacterSheet } from './pages/CharacterSheet/index.jsx';
import { SpellsPage } from './pages/SpellInventory/index.jsx';
import { Header } from './components/Header.jsx';
import Footer from './components/Footer.jsx'; // Import the new Footer component
import { BASE_URL } from './config/constants.js';
import { AbilitiesPage } from './pages/Abilities/index.jsx';
import { AbilityProvider } from './context/AbilityContext.jsx';

export function App() {
    return (
        <CharacterProvider>
            <SpellProvider>
                <AbilityProvider>
                <LocationProvider>
                    <div className="d-flex flex-column min-vh-100">
                        <Header />
                        <main className="flex-grow-1">
                            <Router>
                                <Route path={BASE_URL} component={CharacterSheet} />
                                <Route path={`${BASE_URL}spells`} component={SpellsPage} />
                                <Route path={`${BASE_URL}abilities`} component={AbilitiesPage} />
                                <Route default component={NotFound} />
                            </Router>
                        </main>
                        <Footer buildDate={BUILD_DATE} />
                    </div>
                </LocationProvider>
                </AbilityProvider>
            </SpellProvider>
        </CharacterProvider>
    );
}

render(<App />, document.getElementById('app'));