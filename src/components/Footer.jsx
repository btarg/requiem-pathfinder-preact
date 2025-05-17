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
                    <div className="col-4 text-start d-flex align-items-center">
                        <span className="me-2">Build Date: {buildDate}</span>
                        {githubUrl && (
                            <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-light" title="GitHub Repository">
                                <i className="fab fa-github"></i>
                            </a>
                        )}
                    </div>
                     
                    <div className="col-4 text-center">
                        <QuickRolls />
                    </div>
                    
                    {/* Right Section: Wiki Link */}
                    <div className="col-4 text-end">
                        {wikiUrl && (
                            <a href={wikiUrl} target="_blank" rel="noopener noreferrer" className="btn dark-btn-primary">
                                <i className="fas fa-book me-1"></i>
                                Open Wiki <small><i class="fa-solid fa-arrow-up-right-from-square"></i></small>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;