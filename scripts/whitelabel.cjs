const fs = require('fs');
const path = require('path');
const config = require('../shops-config.json');

const shopKey = process.argv[2];

if (!shopKey || !config[shopKey]) {
    console.error(`Please provide a valid shop key. Available keys: ${Object.keys(config).join(', ')}`);
    process.exit(1);
}

const shop = config[shopKey];
console.log(`🚀 Configuring app for: ${shop.appName} (${shop.appId})...`);

// Paths
const paths = {
    capacitorConfig: path.join(__dirname, '../capacitor.config.ts'),
    androidBuildGradle: path.join(__dirname, '../android/app/build.gradle'),
    androidStrings: path.join(__dirname, '../android/app/src/main/res/values/strings.xml'),
};

// 1. Update Capacitor Config
try {
    let capConfig = fs.readFileSync(paths.capacitorConfig, 'utf8');
    capConfig = capConfig.replace(/appId: '.*'/, `appId: '${shop.appId}'`);
    capConfig = capConfig.replace(/appName: '.*'/, `appName: '${shop.appName}'`);
    fs.writeFileSync(paths.capacitorConfig, capConfig);
    console.log('✅ Updated capacitor.config.ts');
} catch (e) {
    console.error('❌ Failed to update capacitor.config.ts', e);
}

// 2. Update Android build.gradle (applicationId)
try {
    if (fs.existsSync(paths.androidBuildGradle)) {
        let gradle = fs.readFileSync(paths.androidBuildGradle, 'utf8');
        // Regex matches: applicationId "com.example.app"
        gradle = gradle.replace(/applicationId "[^"]*"/, `applicationId "${shop.appId}"`);
        fs.writeFileSync(paths.androidBuildGradle, gradle);
        console.log('✅ Updated android/app/build.gradle');
    } else {
        console.warn('⚠️ Android project not found, skipping build.gradle update');
    }
} catch (e) {
    console.error('❌ Failed to update build.gradle', e);
}

// 3. Update Android Strings (AppName)
try {
    if (fs.existsSync(paths.androidStrings)) {
        let strings = fs.readFileSync(paths.androidStrings, 'utf8');
        // Regex matches: <string name="app_name">Something</string>
        strings = strings.replace(/<string name="app_name">.*?<\/string>/, `<string name="app_name">${shop.appName}<\/string>`);
        fs.writeFileSync(paths.androidStrings, strings);
        console.log('✅ Updated strings.xml');
    } else {
        console.warn('⚠️ strings.xml not found, skipping app name update');
    }
} catch (e) {
    console.error('❌ Failed to update strings.xml', e);
}

// 4. Update Icons (Mock logic - assumes folders exist)
if (shop.iconSource) {
    const sourceDir = path.join(__dirname, '..', shop.iconSource, 'android');
    const destDir = path.join(__dirname, '../android/app/src/main/res');

    if (fs.existsSync(sourceDir)) {
        console.log(`📦 Copying icons from ${sourceDir}...`);
        // Recursive copy function could go here, or use shell command
        // For simplicity in Node:
        try {
            fs.cpSync(sourceDir, destDir, { recursive: true, force: true });
            console.log('✅ Icons updated');
        } catch (e) {
            console.error('❌ Failed to copy icons', e);
        }
    } else {
        console.warn(`⚠️ Icon source directory not found: ${sourceDir}`);
    }
}

console.log(`\n🎉 Configuration complete for ${shopKey}!`);
console.log(`👉 Run 'npx cap sync' to apply changes.`);
