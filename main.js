const { app, Tray, Menu, dialog, BrowserWindow} = require("electron");
const Store = require("electron-store");
const openInCodeLaunch = require("./autorun");
const path = require("path")
const exec = require("child_process").exec;
const appFolder = path.dirname(process.execPath);
const updateExe = path.resolve(appFolder, "..", "Update.exe");
const exeName = path.basename(process.execPath);
const store = new Store();
//store.delete('projects');


new BrowserWindow({
  icon: path.join(__dirname, 'assets','img','vs.png'),
})


let maniTray = {};
const rerenderTray = (tray = maniTray) => {
  const storedData = store.get("projects");
  const projects = storedData ? JSON.parse(storedData) : [];

  const items = projects.map(({ projectName, path }) => ({
    label: projectName,
    submenu: [
      {
        label: "Open",
        click: () => {
          exec(`code ${path}`);
        },
      },
      {
        label: "Remove",
        click: () => {
          store.set(
            "projects",
            JSON.stringify(projects.filter((item) => item.path !== path))
          );
          rerenderTray();
        },
      },
    ],
  }));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Add project",
      click: () => {
        dialog
          .showOpenDialog(null, { properties: ["openDirectory"] })
          .then(({ filePaths }) => {
            const customPath = filePaths[0];
            const arr = customPath.split("/");
            const custonLabel = arr[arr.length - 1];

            store.set(
              "projects",
              JSON.stringify([
                ...projects,
                { projectName: custonLabel, path: customPath },
              ])
            );

            rerenderTray();
          });
      },
    },
    {
      type: "separator",
    },
    ...items,
    {
      type: "separator",
    },
    {
      label: "Close",
      click: ()=> app.exit(0)  
    }
  ]);

  tray.setContextMenu(contextMenu);
};

const isDevelopment = process.env.NODE_ENV !== "production"

const launchAtStartup = ()=>{
  if (process.platform === "darwin") {
    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: true
    });
  } else {
    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: true,
      path: updateExe,
      args: [
        "--processStart",
        `"${exeName}"`,
        "--process-start-args",
        `"--hidden"`
      ]
    });
  }
}

openInCodeLaunch.enable();

openInCodeLaunch.isEnabled().then((isEnabled) => {
  if (isEnabled) return;

  openInCodeLaunch.enable()
}).catch(error => console.error(`Error to lauch app: ${error}`));

app.whenReady().then(() => {
  if(!isDevelopment)launchAtStartup()
  maniTray = new Tray(path.join(__dirname, "assets", "img", "vs.png"));
  rerenderTray(maniTray);
});