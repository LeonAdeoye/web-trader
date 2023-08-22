export class LoggerService
{
    #logLevel;

    constructor()
    {
        this.#logLevel = "INFO";
    }

    logInfo(message)
    {

    }

    logError(message)
    {

    }

    setLogLevel(logLevel)
    {
        this.#logLevel = logLevel;
    }

    log(message, logLevel)
    {
        if(!logLevel)
            logLevel = this.#logLevel;

        switch(logLevel)
        {
            case "INFO":
                this.logInfo(message);
                break;
            case "ERROR":
                this.logError(message);
                break;
            default:
                console.log(message);
        }
    }
}
