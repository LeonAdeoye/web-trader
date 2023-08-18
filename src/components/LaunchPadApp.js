import * as React from 'react';
import './launch-pad-app.css';

const LaunchPadApp = () =>
{
    const apps =
    [
        { name: 'Crypto Ticker', icon: 'crypto-ticker.png', url: 'http://localhost:3000/crypto-ticker' },
        { name: 'Crypto Chart', icon: 'crypto-chart.png', url: 'http://localhost:3000/crypto-chart' },
        { name: 'Stock Ticker', icon: 'stock-ticker.png', url: 'http://localhost:3000/stock-ticker' },
        { name: 'Stock Chart', icon: 'stock-chart.png', url: 'http://localhost:3000/stock-chart' },
        { name: 'Dashboard', icon: 'dashboard.png', url: 'http://localhost:3000/dashboard' },
        { name: 'Users', icon: 'users.png', url: 'http://localhost:3000/users' },
        { name: 'Trade History', icon: 'trade-history.png', url: 'http://localhost:3000/trade-history' },
        { name: 'Alerts', icon: 'alerts.png', url: 'http://localhost:3000/alerts' },
        { name: 'Tasks', icon: 'tasks.png', url: 'http://localhost:3000/tasks' },
        { name: 'Blasts', icon: 'blasts.png', url: 'http://localhost:3000/blasts' },
        { name: 'Configs', icon: 'configs.png', url: 'http://localhost:3000/config' },
        { name: 'Crossings', icon: 'crossings.png', url: 'http://localhost:3000/crossings' }
    ];

    const launchApp = (url) =>
    {
        window.launchPad.openApp(url);
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
