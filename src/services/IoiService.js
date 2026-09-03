import {LoggerService} from "./LoggerService";

export class IoiService
{
    #loggerService;
    #baseUrl;

    constructor()
    {
        this.#loggerService = new LoggerService(this.constructor.name);
        this.#baseUrl = "http://localhost:20018";
    }

    createUuid()
    {
        if (window.crypto?.randomUUID)
            return window.crypto.randomUUID();

        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) =>
        {
            const random = Math.random() * 16 | 0;
            const value = char === "x" ? random : (random & 0x3 | 0x8);
            return value.toString(16);
        });
    }

    async processIoi(request)
    {
        return this.#postJson("/ioi/process", request);
    }

    async processBulk(requests)
    {
        return this.#postJson("/ioi/process/bulk", requests);
    }

    async getLive()
    {
        return this.#getJson("/ioi/live", []);
    }

    async getCancelled()
    {
        return this.#getJson("/ioi/cancelled", []);
    }

    async cancelIoi(requestId)
    {
        return this.#delete(`/ioi/${requestId}`);
    }

    async deleteAll()
    {
        return this.#delete("/ioi/all");
    }

    async getFailures()
    {
        return this.#getJson("/ioi/failures", []);
    }

    async getCreatedTotal()
    {
        return this.#getJson("/ioi/stats/created", { total: 0 });
    }

    async getUnapprovedTotal()
    {
        return this.#getJson("/ioi/stats/unapproved", { total: 0 });
    }

    async getCreatedByTrader()
    {
        return this.#getJson("/ioi/stats/created/trader", {});
    }

    async getCreatedByStock()
    {
        return this.#getJson("/ioi/stats/created/stock", {});
    }

    async getCreatedByMarket()
    {
        return this.#getJson("/ioi/stats/created/market", {});
    }

    async getUnapprovedByTrader()
    {
        return this.#getJson("/ioi/stats/unapproved/trader", {});
    }

    async getUnapprovedByStock()
    {
        return this.#getJson("/ioi/stats/unapproved/stock", {});
    }

    async getUnapprovedByMarket()
    {
        return this.#getJson("/ioi/stats/unapproved/market", {});
    }

    async getUnapprovedByReason()
    {
        return this.#getJson("/ioi/stats/unapproved/reason", {});
    }

    async getBlockedIois()
    {
        return this.#getJson("/ioi/block/failures", []);
    }

    async getBlockedTraders()
    {
        return this.#getJson("/ioi/block/traders", []);
    }

    async getBlockedStocks()
    {
        return this.#getJson("/ioi/block/stocks", []);
    }

    async getBlockedMarkets()
    {
        return this.#getJson("/ioi/block/markets", []);
    }

    async blockTrader(trader)
    {
        return this.#postQuery(`/ioi/block/trader?trader=${encodeURIComponent(trader)}`);
    }

    async unblockTrader(trader)
    {
        return this.#delete(`/ioi/block/trader?trader=${encodeURIComponent(trader)}`);
    }

    async blockStock(stock)
    {
        return this.#postQuery(`/ioi/block/stock?stock=${encodeURIComponent(stock)}`);
    }

    async unblockStock(stock)
    {
        return this.#delete(`/ioi/block/stock?stock=${encodeURIComponent(stock)}`);
    }

    async blockMarket(market)
    {
        return this.#postQuery(`/ioi/block/market?market=${encodeURIComponent(market)}`);
    }

    async unblockMarket(market)
    {
        return this.#delete(`/ioi/block/market?market=${encodeURIComponent(market)}`);
    }

    async reconfigure()
    {
        return this.#getJson("/ioi/reconfigure", {});
    }

    toCountRows(map, nameField)
    {
        return Object.entries(map || {}).map(([name, count]) => ({ [nameField]: name, count }));
    }

    buildRequest(fields)
    {
        return {
            ric: fields.ric,
            trader: fields.trader || "",
            quantity: Number(fields.quantity),
            side: fields.side,
            price: fields.price === "" || fields.price === null || fields.price === undefined ? null : Number(fields.price),
            clientIds: fields.clientIds || [],
            BloombergQualifier: fields.BloombergQualifier || "",
            timestamp: fields.timestamp || Date.now(),
            lifeTimeInMinutes: fields.lifeTimeInMinutes === "" || fields.lifeTimeInMinutes === null || fields.lifeTimeInMinutes === undefined
                ? null
                : Number(fields.lifeTimeInMinutes),
            comment: fields.comment || "",
            requestId: fields.requestId || this.createUuid(),
            ioiFlags: fields.ioiFlags || [],
            originalMarket: fields.originalMarket,
            originalOrderType: fields.originalOrderType || "LIMIT",
            source: "REST"
        };
    }

    async #getJson(path, fallback)
    {
        try
        {
            const response = await fetch(`${this.#baseUrl}${path}`);
            if (!response.ok)
            {
                this.#loggerService.logError(`GET ${path} failed: ${response.status}`);
                return fallback;
            }
            return await response.json();
        }
        catch (error)
        {
            this.#loggerService.logError(`GET ${path} error: ${error.message}`);
            return fallback;
        }
    }

    async #postJson(path, body)
    {
        const response = await fetch(`${this.#baseUrl}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        if (!response.ok)
        {
            const text = await response.text();
            throw new Error(text || `POST ${path} failed: ${response.status}`);
        }
        return await response.json();
    }

    async #postQuery(path)
    {
        const response = await fetch(`${this.#baseUrl}${path}`, { method: "POST" });
        if (!response.ok)
            throw new Error(`POST ${path} failed: ${response.status}`);
    }

    async #delete(path)
    {
        const response = await fetch(`${this.#baseUrl}${path}`, { method: "DELETE" });
        if (!response.ok)
            throw new Error(`DELETE ${path} failed: ${response.status}`);
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    }
}
