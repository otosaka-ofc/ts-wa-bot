import {
    AnyMessageContent,
    MessageType,
    WAMessage,
    WASocket,
} from "@whiskeysockets/baileys";

class ParsedMessage {
    private waMessage: WAMessage;
    public messageType: string;
    public body: string | null;
    public id: string;
    public fromClient: boolean;
    public chat: string;
    private socket: WASocket;

    constructor(waMessage: WAMessage, socket: WASocket) {
        this.socket = socket;
        this.waMessage = waMessage;
        let types: string[] = Object.keys(waMessage.message ?? {});
        switch (types[0] as MessageType) {
            case "extendedTextMessage":
                this.messageType = "extendedTextMessage";
                this.body = String(
                    waMessage.message?.extendedTextMessage?.text,
                );
                break;
            case "imageMessage":
                this.messageType = "imageMessage";
                if (waMessage.message?.imageMessage?.caption) {
                    this.body = String(
                        waMessage.message?.imageMessage?.caption,
                    );
                } else this.body = null;
                break;
            case "audioMessage":
                this.messageType = "audioMessage";
                this.body = null;
                break;
            case "videoMessage":
                this.messageType = "videoMessage";
                if (waMessage.message?.videoMessage?.caption) {
                    this.body = String(
                        waMessage.message?.videoMessage?.caption,
                    );
                } else this.body = null;
                break;
            case "locationMessage":
                this.messageType = "locationMessage";
                this.body = null;
                break;
            case "contactMessage":
                this.messageType = "contactMessage";
                this.body = null;
                break;
            case "documentMessage":
                this.messageType = "documentMessage";
                this.body = null;
                break;
            case "stickerMessage":
                this.messageType = "stickerMessage";
                this.body = null;
                break;
            default:
                this.messageType = types[0] as MessageType;
                this.body = String(waMessage.message?.conversation);
        }

        this.chat = String(waMessage.key.remoteJid);
        this.id = String(waMessage.key.id);
        this.fromClient = Boolean(waMessage.key.fromMe);
    }

    public async reply(message: AnyMessageContent): Promise<any> {
        await this.socket.sendMessage(this.chat, message, {
            quoted: this.waMessage,
        });
    }

    public async dropMessage() {
        if (this.fromClient)
            await this.socket.sendMessage(this.chat, {
                delete: this.waMessage.key,
            });
        else return;
    }
    public async editMessage(text: string): Promise<any> {
        if (this.fromClient)
            await this.socket.sendMessage(this.chat, {
                text,
                edit: this.waMessage.key,
            });
    }
}

export { ParsedMessage };
