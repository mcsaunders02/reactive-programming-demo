import { filter, fromEvent, map, merge, shareReplay, tap } from "rxjs";
import { sendMessage, serverMessages$ } from "./connection";

const form = document.getElementById("form")!;

const userMessages$ = fromEvent<FormDataEvent>(form, "submit").pipe(
    tap((event) => event.preventDefault()),

    map((event) => {
        // Get the input text from the HTML
        const messageInput: HTMLInputElement = (
            event.currentTarget as HTMLFormElement
        ).querySelector('input[name="message"]')!;

        const message = messageInput.value;

        // Clear the HTML input
        messageInput.value = "";
        return message;
    }),

    // Do not allow submitting an empty string
    filter((message) => message.trim().length > 0),

    // Turn the text into a Message object
    map(
        (message: string): Message => ({
            data: message,
            action: "sent",
            timestamp: new Date()
        })
    ),

    // Allows the data to be shared between subscribers
    shareReplay()
);

const messages$ = merge(userMessages$, serverMessages$);

// Add a message to the document when one is received
messages$.subscribe((message) => {
    const newMessage = document.createElement("li");

    newMessage.innerHTML = `
        <div>
            <p class="message-text">${message.data}</p>
            <p class="message-date">${message.action} ${new Date(
        message.timestamp
    ).toLocaleString()}</p>
        </div>
    `;

    newMessage.classList.add(message.action);

    document.getElementById("messages")!.appendChild(newMessage);
});

// Send messages to the websocket
userMessages$.subscribe((message) => {
    sendMessage(message);
});
