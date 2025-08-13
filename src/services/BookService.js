import {LoggerService} from "./LoggerService";

export class BookService
{
    #books;
    #loggerService;

    constructor()
    {
        this.#books = [];
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    loadBooks = async () =>
    {
        await fetch(`http://localhost:20009/book`)
            .then(response => response.json())
            .then(data =>
            {
                if(data.length > 0)
                {
                    this.#books = data;
                    this.#loggerService.logInfo(`Book service loaded ${this.#books.length} books: ${JSON.stringify(this.#books)}`);
                }
                else
                    this.#loggerService.logInfo(`Loaded zero books.`);

            })
            .catch(err => this.#loggerService.logError(err));
    }

    addNewBook = async (newBook) =>
    {
        const {bookId, ...rest} = newBook;
        this.#loggerService.logInfo(`Saving new book: ${JSON.stringify(rest)}.`);
        return await fetch("http://localhost:20009/book", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(rest)})
            .then(response => response.json())
            .then((bookResponse) =>
            {
                this.#books.push(bookResponse);
                this.#loggerService.logInfo(`Successfully saved book: ${JSON.stringify(bookResponse)}.`);
                return bookResponse;
            })
            .catch(error => this.#loggerService.logError(error));
    }

    deleteBook = async (bookId) =>
    {
        return await fetch(`http://localhost:20009/book/${bookId}`, {method: "DELETE"})
            .then(() =>
            {
                for(const current of this.#books)
                {
                    if(current.bookId === bookId)
                    {
                        this.#books.splice(this.#books.indexOf(current), 1);
                        this.#loggerService.logInfo(`Successfully deleted book with book Id: ${bookId}`);
                        break;
                    }
                }
            })
            .catch(error => this.#loggerService.logError(error));
    }

    updateBook = async (bookToUpdate) =>
    {
        this.#loggerService.logInfo(`Updating book: ${JSON.stringify(bookToUpdate)}.`);
        return await fetch(`http://localhost:20009/book`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(bookToUpdate)})
            .then(response => response.json())
            .then((bookResponse) =>
            {
                for(const current of this.#books)
                {
                    if(current.bookId === bookResponse.bookId)
                    {
                        this.#books[this.#books.indexOf(current)] = bookResponse;
                        break;
                    }
                }

                this.#loggerService.logInfo(`Updated book: ${JSON.stringify(bookResponse)}.`);
            })
            .catch(error => this.#loggerService.logError(error));
    }

    clear = () => this.#books.clear();

    getBookById = (bookId) => this.#books.find(book => book.bookId === bookId);

    getBooks = () => this.#books;
}
