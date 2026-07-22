const fs = require('fs');
const path = require('path');

// networkActivityIndicatorVisible was removed from UIKit in iOS SDK 26.
// cordova-plugin-advanced-http still calls it without importing UIKit.
module.exports = function (context) {
  const projectRoot = context.opts.projectRoot;
  const candidates = [
    path.join(projectRoot, 'plugins/cordova-plugin-advanced-http/src/ios/SDNetworkActivityIndicator/SDNetworkActivityIndicator.m'),
    path.join(projectRoot, 'platforms/ios/App/Plugins/cordova-plugin-advanced-http/SDNetworkActivityIndicator.m'),
    // cordova-ios < 8 used the widget name as the project folder
    path.join(projectRoot, 'platforms/ios/test/Plugins/cordova-plugin-advanced-http/SDNetworkActivityIndicator.m'),
  ];

  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;
    const original = fs.readFileSync(filePath, 'utf8');
    if (!original.includes('setNetworkActivityIndicatorVisible')) continue;

    const patched = original.replace(
      /^\s*\[\[UIApplication sharedApplication\] setNetworkActivityIndicatorVisible:(YES|NO)\];\s*$/gm,
      '        // no-op: networkActivityIndicatorVisible removed in iOS SDK 26'
    );
    if (patched !== original) {
      fs.writeFileSync(filePath, patched);
      console.log(`Patched SDNetworkActivityIndicator for iOS SDK 26: ${filePath}`);
    }
  }
};
