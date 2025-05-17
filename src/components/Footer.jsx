import { h } from 'preact';

const Footer = ({ buildDate, githubUrl }) => {
    return (
        <footer className="footer mt-auto py-3 text-light border-top">
            <div className="container text-center">
                <span className="me-3">Build Date: {buildDate}</span>
                {githubUrl && (
                    <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-light">
                        <i className="fab fa-github me-1"></i> GitHub
                    </a>
                )}
            </div>
        </footer>
    );
};

export default Footer;