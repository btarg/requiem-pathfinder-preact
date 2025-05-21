import { useLocation } from 'preact-iso';
import { BASE_URL } from '../config/constants.js';
import DecorativeTitle from './DecorativeTitle.jsx';
import QuickRolls from './QuickRolls.jsx';

const Footer = ({ buildDate }) => {
    const { url } = useLocation();
    const wikiUrl = "https://btarg.github.io/requiem-vault/";
    const githubUrl = "https://github.com/btarg/requiem-pathfinder-preact";

    const characterSheetPath = BASE_URL;
    const spellsPath = BASE_URL === '/' ? '/spells' : `${BASE_URL.replace(/\/$/, '')}/spells`;

    return (
        <footer className="footer mt-auto py-3 text-light border-top">
            <div className="container-fluid">
                <div className="row">
                    {/* Left Section: Build Date and GitHub */}
                    <div className="col-4 text-start text-truncate d-flex align-items-center">
                        <span className="me-2">Build Date: {buildDate}</span>
                        {githubUrl && (
                            <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-light" title="GitHub Repository">
                                <i className="fab fa-github"></i>
                            </a>
                        )}
                    </div>
                     
                    <div className="col-4 text-center">
                        <QuickRolls />
                        <DecorativeTitle title="QUICK ROLLS" containerClassName='mt-3' />
                    </div>
                    
                    {/* Right Section: Wiki Link */}
                    <div className="col-4 d-flex align-items-center justify-content-end">
                        {wikiUrl && (
                            <a href={wikiUrl} target="_blank" rel="noopener noreferrer" className="dark-btn dark-btn-secondary">
                                <i className="fas fa-book me-2"></i>
                                <span className="me-2">Open Wiki</span><i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.75rem' }}></i>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;