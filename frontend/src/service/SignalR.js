import * as signalR from "@microsoft/signalr";

const createConnection = (url, options = {}) => {
    return new signalR.HubConnectionBuilder()
        .withUrl(url, options)
        .withAutomaticReconnect()
        .build();
};

const notificationConnection = () =>
    createConnection("http://localhost:7247/notificationHub");
// createConnection("http://192.168.1.126:7247/notificationHub");

const chatConnection = () =>

    createConnection("http://localhost:7247/chatHub", {
        // createConnection("http://192.168.1.126:7247/chatHub", {
        accessTokenFactory: () => sessionStorage.getItem("authToken"),
    });

export { notificationConnection, chatConnection };