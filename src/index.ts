import { Boom } from "@hapi/boom";
import makeWASocket, {
    ConnectionState,
    DisconnectReason,
    useMultiFileAuthState,
    UserFacingSocketConfig,
    WASocket,
} from "@whiskeysockets/baileys";
import Pino, { Logger, LoggerOptions } from "pino";

async function startAll() {
    let { state, saveCreds } = await useMultiFileAuthState("./auth-session");
    let config: UserFacingSocketConfig = {
        auth: state,
        printQRInTerminal: true,
        browser: ["OTO-Labs", "Chrome", "1.0.0"],
    };
    const sock: WASocket = makeWASocket(config);

    sock.ev.on("connection.update", (update: Partial<ConnectionState>) => {
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

    sock.ev.on("creds.update", saveCreds);
}

startAll();
