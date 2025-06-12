import * as signalR from "@microsoft/signalr";

const createConnection = (url, options = {}) => {
    return new signalR.HubConnectionBuilder()
        .withUrl(url, options)
        .withAutomaticReconnect()
        .build();
};

const notificationConnection = () =>
    createConnection("https://222.255.214.117:7247/notificationHub");

const chatConnection = () =>
    createConnection("https://222.255.214.117:7247/chatHub", {
        accessTokenFactory: () => sessionStorage.getItem("authToken"),
    });

export { notificationConnection, chatConnection };