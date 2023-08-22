export class LoggerService
{
    #logger;

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
        await fetch(`http://localhost:20002/log?logger=${this.#logger}&level=${logLevel}&message=${message}`, {method: "POST"});
    }

    setLogger(logger)
    {
        this.#logger = logger;
    }
}
