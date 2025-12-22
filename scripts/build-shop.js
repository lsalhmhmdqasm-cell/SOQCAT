#!/usr/bin/env node

/**
 * White Label Build Script
 * يبني تطبيق مخصص لكل محل بناءً على ملف التكوين
 * 
 * الاستخدام:
 * node scripts/build-shop.js shop_001
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// الألوان للطباعة
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  yellow: '\x1b[33m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, description) {
  log(`\n▶ ${description}...`, 'blue');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✓ ${description} - تم بنجاح`, 'green');
  } catch (error) {
    log(`✗ ${description} - فشل`, 'red');
    throw error;
  }
}

async function buildShopApp(shopId) {
  const startTime = Date.now();
  
  log('\n═══════════════════════════════════════', 'blue');
  log(`   بناء تطبيق المحل: ${shopId}`, 'blue');
  log('═══════════════════════════════════════\n', 'blue');

  // 1. قراءة ملف التكوين
  const configPath = path.join(__dirname, '..', 'config', 'shops', `${shopId}.json`);
  
  if (!fs.existsSync(configPath)) {
    log(`✗ ملف التكوين غير موجود: ${configPath}`, 'red');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  log(`✓ تم قراءة التكوين: ${config.shopName}`, 'green');

  // 2. تحديث ملف .env.local
  log('\n▶ تحديث متغيرات البيئة...', 'blue');
  const envContent = `VITE_SHOP_ID=${config.shopId}`;
  fs.writeFileSync('.env.local', envContent);
  log('✓ تم تحديث .env.local', 'green');

  // 3. تحديث shops-config.json (للتطبيق)
  log('\n▶ تحديث shops-config.json...', 'blue');
  fs.writeFileSync('shops-config.json', JSON.stringify(config, null, 2));
  log('✓ تم تحديث shops-config.json', 'green');

  // 4. تحديث capacitor.config.ts
  log('\n▶ تحديث Capacitor Config...', 'blue');
  const capacitorConfig = `import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: '${config.appId}',
  appName: '${config.appName}',
  webDir: 'dist'
};

export default config;
`;
  fs.writeFileSync('capacitor.config.ts', capacitorConfig);
  log('✓ تم تحديث capacitor.config.ts', 'green');

  // 5. تحديث manifest.json
  log('\n▶ تحديث manifest.json...', 'blue');
  const manifest = {
    name: config.shopName,
    short_name: config.appName,
    start_url: ".",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: config.primaryColor,
    orientation: "portrait",
    icons: [
      {
        src: config.logo,
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: config.logo,
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
  fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));
  log('✓ تم تحديث manifest.json', 'green');

  // 6. تحديث إعدادات Android (applicationId, version, app_name)
  log('\n▶ تحديث إعدادات Android...', 'blue');
  const gradlePath = path.join('android', 'app', 'build', 'outputs', 'apk'); // للتأكد من وجود مجلدات البناء لاحقاً
  const appGradlePath = path.join('android', 'app', 'build.gradle');
  if (fs.existsSync(appGradlePath)) {
    let gradleContent = fs.readFileSync(appGradlePath, 'utf8');
    gradleContent = gradleContent.replace(/applicationId "[^"]*"/, `applicationId "${config.appId}"`);
    gradleContent = gradleContent.replace(/versionCode \d+/, `versionCode ${config.versionCode}`);
    gradleContent = gradleContent.replace(/versionName "[^"]*"/, `versionName "${config.versionName}"`);
    fs.writeFileSync(appGradlePath, gradleContent);
  } else {
    log('⚠ ملف build.gradle غير موجود، سيتم المتابعة بدون تحديث applicationId', 'yellow');
  }
  // ضبط sdk.dir في local.properties إذا كان متاحاً من البيئة (للـ CI)
  const androidSdkDir = process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME;
  const localPropsPath = path.join('android', 'local.properties');
  if (androidSdkDir) {
    const escapeProp = (p) => p.replace(/\\/g, '\\\\').replace(/:/g, '\\:');
    const sdkLine = `sdk.dir=${escapeProp(androidSdkDir)}`;
    try {
      fs.writeFileSync(localPropsPath, sdkLine);
      log('✓ تم ضبط sdk.dir في android/local.properties', 'green');
    } catch (e) {
      log('⚠ فشل ضبط android/local.properties، سيتم الاعتماد على الإعدادات الحالية', 'yellow');
    }
  } else {
    log('⚠ لم يتم العثور على ANDROID_SDK_ROOT/ANDROID_HOME في البيئة، سيتم استخدام local.properties الافتراضي', 'yellow');
  }
  const stringsPath = path.join('android', 'app', 'src', 'main', 'res', 'values', 'strings.xml');
  if (fs.existsSync(stringsPath)) {
    let stringsContent = fs.readFileSync(stringsPath, 'utf8');
    stringsContent = stringsContent.replace(/<string name="app_name">.*?<\/string>/, `<string name="app_name">${config.appName}</string>`);
    fs.writeFileSync(stringsPath, stringsContent);
  } else {
    log('⚠ ملف strings.xml غير موجود، سيتم المتابعة بدون تحديث اسم التطبيق', 'yellow');
  }
  log('✓ تم تحديث إعدادات Android', 'green');

  // 6. بناء التطبيق
  exec('npm run build', 'بناء Frontend');

  // 7. مزامنة Capacitor
  exec('npx cap sync', 'مزامنة Capacitor');

  // 8. بناء Android APK
  log('\n▶ بناء Android APK...', 'blue');
  try {
    const gradleHome = path.join(__dirname, '..', '.gradle');
    process.env.GRADLE_USER_HOME = gradleHome;
    if (!fs.existsSync(gradleHome)) {
      fs.mkdirSync(gradleHome, { recursive: true });
    }
    log(`GRADLE_USER_HOME=${gradleHome}`, 'blue');
  } catch (e) {
    log('⚠ لم يتمكن السكربت من إنشاء مجلد GRADLE_USER_HOME، سيُستخدم الإعداد الافتراضي', 'yellow');
  }
  process.chdir('android');
  const gradleCmd = process.platform === 'win32' ? '.\\gradlew.bat assembleRelease' : './gradlew assembleRelease';
  exec(gradleCmd, 'بناء APK');
  process.chdir('..');

  // 9. نسخ APK إلى مجلد الإخراج
  const outputDir = path.join(__dirname, '..', 'builds', shopId);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const releaseDir = path.join('android', 'app', 'build', 'outputs', 'apk', 'release');
  let candidates = [];
  if (fs.existsSync(releaseDir)) {
    candidates = candidates.concat(
      fs.readdirSync(releaseDir)
        .filter(f => f.toLowerCase().endsWith('.apk'))
        .map(f => path.join(releaseDir, f))
    );
  }
  if (candidates.length === 0) {
    const apkBaseDir = path.join('android', 'app', 'build', 'outputs', 'apk');
    if (fs.existsSync(apkBaseDir)) {
      const entries = fs.readdirSync(apkBaseDir).map(name => path.join(apkBaseDir, name));
      const dirs = entries.filter(p => {
        try { return fs.lstatSync(p).isDirectory(); } catch { return false; }
      });
      for (const d of dirs) {
        try {
          const apks = fs.readdirSync(d)
            .filter(f => f.toLowerCase().endsWith('.apk'))
            .map(f => path.join(d, f));
          candidates = candidates.concat(apks);
        } catch {}
      }
      try {
        const baseApks = fs.readdirSync(apkBaseDir)
          .filter(f => f.toLowerCase().endsWith('.apk'))
          .map(f => path.join(apkBaseDir, f));
        candidates = candidates.concat(baseApks);
      } catch {}
    }
  }
  if (candidates.length === 0) {
    throw new Error('لم يتم العثور على ملف APK داخل android/app/build/outputs/apk/');
  }
  const apkSource = candidates.sort((a, b) => {
    try {
      return (fs.statSync(b).mtimeMs || 0) - (fs.statSync(a).mtimeMs || 0);
    } catch {
      return 0;
    }
  })[0];
  const apkDest = path.join(outputDir, `${config.appName.replace(/\s+/g, '_')}_v${config.versionName}.apk`);
  fs.copyFileSync(apkSource, apkDest);
  log(`✓ تم نسخ APK إلى: ${apkDest}`, 'green');

  // 10. إنشاء ملف معلومات
  const infoContent = `
تطبيق: ${config.shopName}
المالك: ${config.ownerName}
الإصدار: ${config.versionName} (${config.versionCode})
تاريخ البناء: ${new Date().toLocaleString('ar-YE')}
Package Name: ${config.appId}
الهاتف: ${config.phone}
العنوان: ${config.address}

ملاحظات:
- التطبيق جاهز للتوزيع
- يمكن إرساله عبر واتساب/تلجرام
- أو رفعه على Google Play Store

للدعم الفني:
اتصل بالمطور
`;
  fs.writeFileSync(path.join(outputDir, 'معلومات_التطبيق.txt'), infoContent);

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  log('\n═══════════════════════════════════════', 'green');
  log(`   ✓ اكتمل البناء بنجاح!`, 'green');
  log(`   الوقت المستغرق: ${duration} ثانية`, 'green');
  log(`   الملف: ${apkDest}`, 'green');
  log('═══════════════════════════════════════\n', 'green');
}

// التنفيذ
const shopId = process.argv[2];

if (!shopId) {
  log('✗ يرجى تحديد معرف المحل', 'red');
  log('الاستخدام: node scripts/build-shop.js shop_001', 'yellow');
  process.exit(1);
}

buildShopApp(shopId).catch(error => {
  log(`\n✗ حدث خطأ: ${error.message}`, 'red');
  process.exit(1);
});
