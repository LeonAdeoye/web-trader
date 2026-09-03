const LOG_LEVELS = Object.freeze({
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
});

const DEFAULT_LOG_LEVEL = 'INFO';

const normalizeLogLevel = (level) =>
{
    if (level == null)
        return null;

    const normalized = String(level).trim().toUpperCase();
    if (Object.prototype.hasOwnProperty.call(LOG_LEVELS, normalized))
        return normalized;

    return null;
};

const resolveInitialLogLevel = () =>
{
    const envLevel = typeof process !== 'undefined' ? process.env?.REACT_APP_LOG_LEVEL : undefined;
    return normalizeLogLevel(envLevel) || DEFAULT_LOG_LEVEL;
};

export class LoggerService
{
    static #logLevel = resolveInitialLogLevel();
    #logger;

    constructor(logger)
    {
        this.#logger = logger;
    }

    static getLogLevel()
    {
        return LoggerService.#logLevel;
    }

    static setLogLevel(level)
    {
        const normalized = normalizeLogLevel(level);
        if (!normalized)
            return LoggerService.#logLevel;

        LoggerService.#logLevel = normalized;
        return LoggerService.#logLevel;
    }

    static #shouldLog(logLevel)
    {
        if (logLevel === 'ERROR')
            return true;

        return LOG_LEVELS[logLevel] >= LOG_LEVELS[LoggerService.#logLevel];
    }

    logDebug = (message) =>
    {
        this.#logMessage(message, "DEBUG");
    }

    logInfo = (message) =>
    {
        this.#logMessage(message, "INFO");
    }

    logWarn = (message) =>
    {
        this.#logMessage(message, "WARN");
    }

    logError = (message) =>
    {
        const text = message instanceof Error ? `${message.name}: ${message.message}` : String(message ?? "");
        if (text.includes("Failed to fetch"))
            this.#logMessage(text, "WARN");
        else
            this.#logMessage(text, "ERROR");
    }

    #logMessage = (message, logLevel) =>
    {
        if (!LoggerService.#shouldLog(logLevel))
            return;

        fetch(`http://localhost:20002/log`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({logger: this.#logger, level: logLevel, message: message})
            })
            .then(() => console.log(`Logger: ${this.#logger}, Level: ${logLevel}, message: ${message}`))
            .catch(err => console.log("Error: " + err + ", while " + this.#logger + " trying to log: " +  message));
    }
}

if (typeof window !== 'undefined')
{
    window.setLogLevel = (level) => LoggerService.setLogLevel(level);
    window.getLogLevel = () => LoggerService.getLogLevel();
}
