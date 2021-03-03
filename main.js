//https://www.youtube.com/watch?v=kN1Czs0m1SU
//22:31

const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;

// Listen for app to be ready, when the app is ready run function
app.on('ready', function(){
    // Create new main window
    mainWindow = new BrowserWindow(
        {
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        }
    );
    //Loading the html file
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    });

    //Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert menu
    Menu.setApplicationMenu(mainMenu);
});

// Handle create addWindow
function createAddWindow() {
    //Creating new addWindow
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title:'Add Crypto',
        webPreferences: {
            contextIsolation: false,
            nodeIntegration:true
        }
    });
    // Loading the html file
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Garbage Collection Handle
    addWindow.on('close', function(){
        addWindow = null;
    });
}

// Catch crypto:add
ipcMain.on('crypto:add', function(e, crypto) {
    console.log(crypto)
    mainWindow.webContents.send('crypto:add', crypto);
    addWindow.close();
});


// Create menu template
const mainMenuTemplate = [
    {
        label:'File',
        submenu:[
            {
                label: 'Add Crypto',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear watchlist',
                click(){
                    mainWindow.webContents.send('watchlist:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 
                'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

// If on Mac, add an empty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// Adding Developer tools item not in production moe
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 
                'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}