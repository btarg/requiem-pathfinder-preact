import SpellManager from '../../components/SpellManager';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';

export function Home() {
	return (
		<div class="home">
            <SpellManager />
		</div>
	);
}

