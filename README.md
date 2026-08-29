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
