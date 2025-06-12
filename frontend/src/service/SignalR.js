import * as signalR from "@microsoft/signalr";

const createConnection = (url, options = {}) => {
    return new signalR.HubConnectionBuilder()
        .withUrl(url, options)
        .withAutomaticReconnect()
        .build();
};

const notificationConnection = () =>
    createConnection("https://hrsystem.name.vn/notificationHub");

const chatConnection = () =>
    createConnection("https://hrsystem.name.vn/chatHub", {
        accessTokenFactory: () => sessionStorage.getItem("authToken"),
    });

export { notificationConnection, chatConnection };