import * as React from 'react';
import './launch-pad-app.css';

const LaunchPadApp = () =>
{
    const apps =
    [
        { title: 'Crypto Ticker', icon: 'file:///assets/ticker.png', url: 'http://localhost:3000/crypto-ticker' },
        { title: 'Crypto Chart', icon: 'file:///assets/chart.png', url: 'http://localhost:3000/crypto-chart' },
        { title: 'Stock Ticker', icon: 'file:///assets/ticker.png', url: 'http://localhost:3000/stock-ticker' },
        { title: 'Stock Chart', icon: 'file:///assets/chart.png', url: 'http://localhost:3000/stock-chart' },
        { title: 'Configs', icon: 'file:///assets/configs.png', url: 'http://localhost:3000/configs' },
        { title: 'Users', icon: 'file:///assets/user.png', url: 'http://localhost:3000/users' },
        { title: 'Dashboard', icon: 'file:///assets/dashboard.png', url: 'http://localhost:3000/dashboard' },
        { title: 'Trade History', icon: 'file:///assets/trade-history.png', url: 'http://localhost:3000/trade-history' },
        { title: 'Alerts', icon: 'file:///assets/alerts.png', url: 'http://localhost:3000/alerts' },
        { title: 'Tasks', icon: 'file:///assets/tasks.png', url: 'http://localhost:3000/tasks' },
        { title: 'Blasts', icon: 'file:///assets/blasts.png', url: 'http://localhost:3000/blasts' },
        { title: 'Crosses', icon: 'file:///assets/crosses.png', url: 'http://localhost:3000/crosses' },
        { title: 'News', icon: 'file:///assets/news.png', url: 'http://localhost:3000/news' },
        { title: 'IOIs', icon: 'file:///assets/iois.png', url: 'http://localhost:3000/ioi' },
        { title: 'TCA', icon: 'file:///assets/tca.png', url: 'http://localhost:3000/tca' },
        { title: 'Workflow', icon: 'file:///assets/workflow.png', url: 'http://localhost:3000/workflow' },
        { title: 'Insights', icon: 'file:///assets/insights.png', url: 'http://localhost:3000/insights' },
        { title: 'Reports', icon: 'file:///assets/reports.png', url: 'http://localhost:3000/reports' }
    ];

    const launchApp = (url, title) =>
    {
        window.launchPad.openApp({url: url, title: title});
    };

    return (
        <div className="launch-pad">
            {apps.map((app) => (
                <div key={app.title} className="launch-pad__app" onClick={() => launchApp(app.url, app.title)}>
                    <img className="launch-pad__icon" src={app.icon} alt={app.title}/>
                    <span className="launch-pad__name">{app.title}</span>
                </div>
            ))}
        </div>
    );
};

export default LaunchPadApp;
