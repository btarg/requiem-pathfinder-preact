import { render } from 'preact';
import { LocationProvider, Router, Route } from 'preact-iso';
import { CharacterProvider } from './context/CharacterContext';

import { Header } from './components/Header.jsx';
import { SpellsAndStats } from './pages/SpellInventory/index.jsx';
import { NotFound } from './pages/_404.jsx';
import { Stats } from './pages/StatsPage';
import { SpellProvider } from './context/SpellContext';

import './style.scss';
import '@fortawesome/fontawesome-free/scss/solid.scss';


export function App() {
    return (
        <CharacterProvider>
            <SpellProvider>
                <LocationProvider>
                    <Header />
                    <main>
                        <Router>
                            <Route path="/requiem-pathfinder-preact/" component={Stats} />
                            <Route path="/requiem-pathfinder-preact/spells" component={SpellsAndStats} />
                            <Route default component={NotFound} />
                        </Router>
                    </main>
                </LocationProvider>
            </SpellProvider>
        </CharacterProvider>
    );
}

render(<App />, document.getElementById('app'));