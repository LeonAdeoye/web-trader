import {LoggerService} from "./LoggerService";

export class AccountService {
    #accounts;
    #loggerService;

    constructor() {
        this.#accounts = [];
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    loadAccounts = async () => {
        if (this.#accounts.length !== 0)
            return;

        await fetch('http://localhost:20009/account')
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    this.#accounts = data;
                    this.#loggerService.logInfo(`Loaded ${data.length} accounts: ${JSON.stringify(this.#accounts)}`);
                } else {
                    this.#loggerService.logInfo(`Loaded zero accounts.`);
                }
            })
            .catch(err => this.#loggerService.logError(err));
    }

    getAccounts = () => {
        return this.#accounts.filter(account => account.active);
    }

    getAccountByMnemonic = (mnemonic) => {
        return this.#accounts.find(account => account.accountMnemonic === mnemonic);
    }

    clear = () => {
        this.#accounts = [];
    }
} 
