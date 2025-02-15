import { useLocation } from 'preact-iso';

export function Header() {
	const { url } = useLocation();

	return (
		<header>
			<nav>
				<a href="/" class={url == '/' && 'active'}>
					Stats
				</a>
                <a href="/spells" class={url == '/spells' && 'active'}>
                    Spells
                </a>
			</nav>
		</header>
	);
}
