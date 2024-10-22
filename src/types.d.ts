type Message = {
    data: string;
    timestamp: Date;
    action: "sent" | "received";
};
