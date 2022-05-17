const AutoLaunch =  require("auto-launch");
const { app } = require('electron')

module.exports = new AutoLaunch({
    name: 'OpenInCode',
    isHidden: true
}) 

