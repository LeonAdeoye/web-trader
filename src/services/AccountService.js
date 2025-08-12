import {LoggerService} from "./LoggerService";

export class AccountService
{
    #accounts;
    #loggerService;

    constructor()
    {
        this.#accounts = [];
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    loadAccounts = async () =>
    {
        await fetch('http://localhost:20009/account')
            .then(response => response.json())
            .then(data =>
            {
                if (data.length > 0)
                {
                    this.#accounts = data;
                    this.#loggerService.logInfo(`Loaded ${data.length} accounts: ${JSON.stringify(this.#accounts)}`);
                }
                else
                    this.#loggerService.logInfo(`Loaded zero accounts.`);
            })
            .catch(err => this.#loggerService.logError(err));
    }

    getAccounts = () =>
    {
        return this.#accounts.filter(account => account.active);
    }

    getAccountByMnemonic = (mnemonic) =>
    {
        return this.#accounts.find(account => account.accountMnemonic === mnemonic);
    }

    clear = () =>
    {
        this.#accounts = [];
    }

    addNewAccount = async (newAccount) =>
    {
        const {accountId, ...rest} = newAccount;
        this.#loggerService.logInfo(`Saving new account: ${JSON.stringify(newAccount)}.`);
        return await fetch("http://localhost:20009/account", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(rest)})
            .then(response => response.json())
            .then((accountResponse) =>
            {
                this.#accounts.push(accountResponse);
                this.#loggerService.logInfo(`Successfully saved account: ${JSON.stringify(accountResponse)}.`);
                return accountResponse;
            })
            .catch(error => this.#loggerService.logError(error));
    }

    updateAccount = async (accountToUpdate) =>
    {
        this.#loggerService.logInfo(`Updating account: ${JSON.stringify(accountToUpdate)}.`);
        return await fetch(`http://localhost:20009/account`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(accountToUpdate)})
            .then(response => response.json())
            .then((accountResponse) =>
            {
                for(const current of this.#accounts)
                {
                    if(current.accountId === accountResponse.accountId)
                    {
                        this.#accounts[this.#accounts.indexOf(current)] = accountResponse;
                        break;
                    }
                }
                this.#loggerService.logInfo(`Updated account: ${JSON.stringify(accountResponse)}.`);
                return accountResponse;
            })
            .catch(error => this.#loggerService.logError(error));
    }

    deleteAccount = async (accountId) =>
    {
        return await fetch(`http://localhost:20009/account/${accountId}`, {method: "DELETE"})
            .then(() =>
            {
                for(const current of this.#accounts)
                {
                    if(current.accountId === accountId)
                    {
                        this.#accounts.splice(this.#accounts.indexOf(current), 1);
                        this.#loggerService.logInfo(`Successfully deleted account with account Id: ${accountId}`);
                        break;
                    }
                }
            })
            .catch(error => this.#loggerService.logError(error));
    }
} 
