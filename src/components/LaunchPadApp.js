import * as React from 'react';
import './launch-pad-app.css';


const LaunchPadApp = () =>
{
    const apps =
    [
        { name: 'Crypto Ticker', icon: 'user.png', url: 'http://localhost:3000/crypto-ticker' },
        { name: 'Crypto Chart', icon: 'user.jpg', url: 'http://localhost:3000/crypto-chart' },
        { name: 'Stock Ticker', icon: './user.png', url: 'http://localhost:3000/stock-ticker' },
        { name: 'Stock Chart', icon: 'src/components/user.png', url: 'http://localhost:3000/stock-chart' },
        { name: 'Dashboard', icon: './src/components/user.png', url: 'http://localhost:3000/dashboard' },
        { name: 'Users', icon: 'user.png', url: 'http://localhost:3000/users' },
        { name: 'Trade History', icon: 'file://./src/components/user.png', url: 'http://localhost:3000/trade-history' },
        { name: 'Alerts', icon: 'file://components/user.png', url: 'http://localhost:3000/alerts' },
        { name: 'Tasks', icon: 'file://src/components/user.png', url: 'http://localhost:3000/tasks' },
        { name: 'Blasts', icon: './components/user.png', url: 'http://localhost:3000/blasts' },
        { name: 'Configs', icon: './components/user.jpg', url: 'http://localhost:3000/config' },
        { name: 'Crosses', icon: 'crosses.png', url: 'http://localhost:3000/crosses' },
        { name: 'News', icon: 'news.png', url: 'http://localhost:3000/news' },
        { name: 'IOIs', icon: 'news.png', url: 'http://localhost:3000/ioi' },
        { name: 'TCA', icon: 'news.png', url: 'http://localhost:3000/tca' },
        { name: 'Workflow', icon: 'workflow.png', url: 'http://localhost:3000/workflow' },
        { name: 'Insights', icon: 'insights.png', url: 'http://localhost:3000/insights' },
        { name: 'Reports', icon: 'reports.png', url: 'http://localhost:3000/reports' }
    ];

    const launchApp = (url,title) =>
    {
        window.launchPad.openApp({url: url, title: title});
    };

    return (
        <div className="launch-pad">
            {apps.map((app) => (
                <div key={app.name} className="launch-pad__app" onClick={() => launchApp(app.url, app.name)}>
                    <img className="launch-pad__icon" src={app.icon} alt={app.name}/>
                    <span className="launch-pad__name">{app.name}</span>
                    <div className="div-img"></div>
                </div>
            ))}
        </div>
    );
};

export default LaunchPadApp;
