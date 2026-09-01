# Web Trader

## Build

To build files in the `./build` directory, run:

```bash
npm run electron:build
```

## Backend

Open WSL or Windows PowerShell, then start AMPS:

* bash
* cd /mnt/c/AMPS-5.3.3.118-Release-Linux/bin
* ./ampServer minimal.xml

To start and stop back-end services:

* cd /mnt/c/Users/'Leon Adeoye'/development/scripts
* ./start-all-services.sh
* ./stop-all-service.sh

## Run

To run the app from the command line:

```bash
npm run electron:serve
```

## Logging

Log levels follow: `DEBUG` < `INFO` < `WARN` < `ERROR`. 

`ERROR` always logs.

On startup the level comes from `REACT_APP_LOG_LEVEL` in `LoggerService.resolveInitialLogLevel()` (default `INFO`). 

You do not need to call `setLogLevel` from a React component for normal use.

To start with DEBUG:

```bash
npm run electron:serve:debug
```

To change it while the app is running, open the DevTools console in any window:

```javascript
window.getLogLevel()        // current level
window.setLogLevel('DEBUG') // show debug logs
window.setLogLevel('INFO')  // hide debug logs again
window.setLogLevel('WARN')  // only warn + error
```

To set it from code:

```javascript
import { LoggerService } from './services/LoggerService';

LoggerService.setLogLevel('DEBUG');
```
