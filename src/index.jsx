import { render } from 'preact';
import { NotFound } from './pages/_404.jsx';
import { LocationProvider, Router, Route } from 'preact-iso';
import { CharacterProvider } from './context/CharacterContext';
import { SpellsAndStats } from './pages/SpellInventory/index.jsx';
import { SpellProvider } from './context/SpellContext';

import './style.scss';
import '@fortawesome/fontawesome-free/scss/solid.scss';

const BASE_URL = import.meta.env.BASE_URL || '/';

export function App() {
    return (
        <CharacterProvider>
            <SpellProvider>
                <LocationProvider>
                    <main>
                        <Router>
                            <Route path={BASE_URL} component={SpellsAndStats} />
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