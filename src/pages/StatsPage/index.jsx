import CharacterStats from '../../components/CharacterStats';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';

export function Stats() {
    return (
        <div className="stats">
            <CharacterStats />
        </div>
    );
}