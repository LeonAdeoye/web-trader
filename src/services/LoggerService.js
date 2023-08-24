export class LoggerService
{
    #logger;

    constructor(logger)
    {
        this.#logger = logger;
    }

    async logInfo(message)
    {
        await this.#logMessage(message, "INFO");
    }

    async logError(message)
    {
        await this.#logMessage(message, "ERROR");
    }

    async #logMessage(message, logLevel)
    {
        console.log(`Logger: ${this.#logger}, Level: ${logLevel}, message: ${message}`);
        await fetch(`http://localhost:20002/log`,
            {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({logger: this.#logger, level: logLevel, message: message})
                });
    }
}
