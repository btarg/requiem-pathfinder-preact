import SpellManager from '../../components/SpellManager';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Stats } from '../StatsPage';

export function SpellInventory() {
    return (
        <div className="spell-inventory container-fluid">
            <div className="row vh-100">
                <div className="col-4 p-3" style={{ height: '100vh', overflowY: 'auto' }}>
                    <Stats />
                </div>
                <div className="col-8 p-3" style={{ height: '100vh', overflowY: 'auto' }}>
                    <SpellManager />
                </div>
            </div>
        </div>
    );
}