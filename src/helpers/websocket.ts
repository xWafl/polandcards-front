export const sendSocket = (
    socket: WebSocket,
    category: string,
    data: unknown
) => {
    const stringified = JSON.stringify({ category, data });
    socket.send(stringified);
};

export const websocketHandler = (str: string) => JSON.parse(str);
