import { useLocation } from 'preact-iso';

const BASE_URL = '/requiem-pathfinder-preact';

export function Header() {
    const { url } = useLocation();

    return (
        <header>
            <nav>
                <a 
                    href={`${BASE_URL}/`} 
                    class={url === BASE_URL || url === `${BASE_URL}/` ? 'active' : ''}
                >
                    Stats
                </a>
                <a 
                    href={`${BASE_URL}/spells`} 
                    class={url === `${BASE_URL}/spells` ? 'active' : ''}
                >
                    Spells
                </a>
            </nav>
        </header>
    );
}