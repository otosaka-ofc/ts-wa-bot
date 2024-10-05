import { Boom } from "@hapi/boom";
import makeWASocket, {
    ConnectionState,
    DisconnectReason,
    MessageUpsertType,
    useMultiFileAuthState,
    UserFacingSocketConfig,
    WAMessage,
    WASocket,
} from "@whiskeysockets/baileys";
import Pino, { Logger, LoggerOptions } from "pino";
import { messageController } from "./controllers";

async function startAll() {
    let { state, saveCreds } = await useMultiFileAuthState("./auth-session");
    let config: UserFacingSocketConfig = {
        auth: state,
        printQRInTerminal: true,
        browser: ["OTO-Labs", "Chrome", "1.0.0"],
    };
    const socket: WASocket = await makeWASocket(config);

    socket.ev.on("connection.update", (update: Partial<ConnectionState>) => {
        let { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect: boolean =
                (lastDisconnect?.error as Boom)?.output?.statusCode !==
                DisconnectReason.loggedOut;
            if (shouldReconnect) {
                startAll();
            }
        } else if (connection === "open") {
            console.log("Connection Opened.");
        }
    });

    socket.ev.on("creds.update", saveCreds);
    socket.ev.on(
        "messages.upsert",
        (arg: { messages: WAMessage[]; type: MessageUpsertType }) =>
            messageController(arg, socket),
    );
}

startAll();
