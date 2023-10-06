export class LoggerService
{
    #logger;

    constructor(logger)
    {
        this.#logger = logger;
    }

    logInfo = (message) =>
    {
        this.#logMessage(message, "INFO");
    }

    logError = (message) =>
    {
        this.#logMessage(message, "ERROR");
    }

    #logMessage = (message, logLevel) =>
    {
        fetch(`http://localhost:20002/log`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({logger: this.#logger, level: logLevel, message: message})
            })
            .then(() => console.log(`Logger: ${this.#logger}, Level: ${logLevel}, message: ${message}`))
            .catch(err => console.log("Error: " + err + ", while " + this.#logger + " trying to log: " +  message));
    }
}
