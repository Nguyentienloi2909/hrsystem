import * as signalR from "@microsoft/signalr";

const createConnection = (url, options = {}) => {
    return new signalR.HubConnectionBuilder()
        .withUrl(url, options)
        .withAutomaticReconnect() 
        .build();
};

const notificationConnection = () =>
    createConnection("http://hrsystem.name.vn:7247/notificationHub", {
        accessTokenFactory: () => sessionStorage.getItem("authToken"),
    });

const chatConnection = () =>
    createConnection("http://hrsystem.name.vn:7247/chatHub", {
        accessTokenFactory: () => sessionStorage.getItem("authToken"),
    });

export { notificationConnection, chatConnection };