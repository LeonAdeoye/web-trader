import * as React from 'react';
import './launch-pad-app.css';

const LaunchPadApp = () =>
{
    const apps =
    [
        { name: 'Dashboard', icon: 'dashboard', url: 'PriceChartApp.js' },
        { name: 'Users', icon: 'user.png', url: 'CryptoTickerApp.js' },
        { name: 'History', icon: 'user.png', url: 'CryptoTickerApp.js' },
        { name: 'Trades', icon: 'user.png', url: 'CryptoTickerApp.js' },
        { name: 'Alerts', icon: 'user.png', url: 'CryptoTickerApp.js' },
        { name: 'Tasks', icon: 'user.png', url: 'CryptoTickerApp.js' },
        { name: 'Blast', icon: './user.png', url: 'CryptoTickerApp.js' },
        { name: 'Config', icon: './user.png', url: 'CryptoTickerApp.js' }
    ];

    const launchApp = (url) =>
    {
        window.open(url);
    };

    return (
        <div className="launch-pad">
            {apps.map((app) => (
                <div key={app.name} className="launch-pad__app" onClick={() => launchApp(app.url)}>
                    <img className="launch-pad__icon" src={app.icon} alt={app.name}/>
                    <span className="launch-pad__name">{app.name}</span>
                    <div className="div-img"></div>
                </div>
            ))}
        </div>
    );
};

export default LaunchPadApp;
