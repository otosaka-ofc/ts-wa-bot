import {
    MessageUpsertType,
    WAMessage,
    WASocket,
} from "@whiskeysockets/baileys";
import { ParsedMessage } from "../utils";
import similarity from "similarity";

export async function messageController(
    arg: { messages: WAMessage[]; type: MessageUpsertType },
    socket: WASocket,
) {
    let message: WAMessage = arg.messages[arg.messages.length - 1];
    let parsedMessage: ParsedMessage = new ParsedMessage(message, socket);
    if (parsedMessage.fromClient) return;

    let prefixes: string[] = ["=>", ".", "$"];
    let firstToken: string | null = parsedMessage.body?.split(" ")[0] ?? null;
    let isValidPrefix: boolean = false;
    let usedPrefixIndex: number = 0;
    prefixes.forEach((prefix: string, index: number) => {
        if (!isValidPrefix && parsedMessage.body?.startsWith(prefix)) {
            isValidPrefix = true;
            usedPrefixIndex = index;
        }
    });
    let command = "test";
    if (isValidPrefix) {
        let similar: boolean =
            similarity(
                firstToken?.slice(prefixes[usedPrefixIndex].length) ?? "",
                command,
            ) >= 0.5
                ? true
                : false;

        let usedPrefix = prefixes[usedPrefixIndex];
    }
}
