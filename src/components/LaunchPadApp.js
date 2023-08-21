import * as React from 'react';
import './launch-pad-app.css';

const LaunchPadApp = () =>
{
    const apps =
    [
        { name: 'Crypto Ticker', icon: 'file:///assets/ticker.png', url: 'http://localhost:3000/crypto-ticker' },
        { name: 'Crypto Chart', icon: 'file:///assets/chart.png', url: 'http://localhost:3000/crypto-chart' },
        { name: 'Stock Ticker', icon: 'file:///assets/ticker.png', url: 'http://localhost:3000/stock-ticker' },
        { name: 'Stock Chart', icon: 'file:///assets/chart.png', url: 'http://localhost:3000/stock-chart' },
        { name: 'Configs', icon: 'file:///assets/configs.png', url: 'http://localhost:3000/configs' },
        { name: 'Users', icon: 'file:///assets/user.png', url: 'http://localhost:3000/users' },
        { name: 'Dashboard', icon: 'file:///assets/dashboard.png', url: 'http://localhost:3000/dashboard' },
        { name: 'Trade History', icon: 'file:///assets/trade-history.png', url: 'http://localhost:3000/trade-history' },
        { name: 'Alerts', icon: 'file:///assets/alerts.png', url: 'http://localhost:3000/alerts' },
        { name: 'Tasks', icon: 'file:///assets/tasks.png', url: 'http://localhost:3000/tasks' },
        { name: 'Blasts', icon: 'file:///assets/blasts.png', url: 'http://localhost:3000/blasts' },
        { name: 'Crosses', icon: 'file:///assets/crosses.png', url: 'http://localhost:3000/crosses' },
        { name: 'News', icon: 'file:///assets/news.png', url: 'http://localhost:3000/news' },
        { name: 'IOIs', icon: 'file:///assets/iois.png', url: 'http://localhost:3000/ioi' },
        { name: 'TCA', icon: 'file:///assets/tca.png', url: 'http://localhost:3000/tca' },
        { name: 'Workflow', icon: 'file:///assets/workflow.png', url: 'http://localhost:3000/workflow' },
        { name: 'Insights', icon: 'file:///assets/insights.png', url: 'http://localhost:3000/insights' },
        { name: 'Reports', icon: 'file:///assets/reports.png', url: 'http://localhost:3000/reports' }
    ];

    const launchApp = (url, title) =>
    {
        window.launchPad.openApp({url: url, title: title});
    };

    return (
        <div className="launch-pad">
            {apps.map((app) => (
                <div key={app.name} className="launch-pad__app" onClick={() => launchApp(app.url, app.name)}>
                    <img className="launch-pad__icon" src={app.icon} alt={app.name}/>
                    <span className="launch-pad__name">{app.name}</span>
                </div>
            ))}
        </div>
    );
};

export default LaunchPadApp;
