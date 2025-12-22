#!/usr/bin/env node

/**
 * Generate Shop Config
 * يساعدك في إنشاء ملف تكوين جديد لمحل
 * 
 * الاستخدام:
 * node scripts/generate-config.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

async function generateConfig() {
    console.log('\n╔═══════════════════════════════════════╗');
    console.log('║   إنشاء تكوين محل جديد               ║');
    console.log('╚═══════════════════════════════════════╝\n');

    // جمع المعلومات
    const shopName = await question('اسم المحل: ');
    const ownerName = await question('اسم المالك: ');
    const phone = await question('رقم الهاتف: ');
    const whatsapp = await question('رقم واتساب (اختياري - اضغط Enter للتخطي): ') || phone;
    const address = await question('العنوان: ');
    const city = await question('المدينة: ');
    const primaryColor = await question('اللون الأساسي (مثال: #15803d): ') || '#15803d';

    // توليد معرف فريد
    const shopId = `shop_${Date.now().toString().slice(-6)}`;
    const slug = generateSlug(shopName);
    const appId = `com.qatshop.${slug}`;

    const config = {
        shopId,
        shopName,
        ownerName,
        slug,
        logo: `https://yourcdn.com/logos/${slug}.png`,
        splashLogo: `https://yourcdn.com/logos/${slug}_splash.png`,
        primaryColor,
        secondaryColor: primaryColor,
        phone,
        whatsapp: whatsapp.startsWith('967') ? whatsapp : `967${whatsapp}`,
        address,
        city,
        appId,
        appName: shopName,
        packageName: appId,
        versionCode: 1,
        versionName: "1.0.0",
        createdAt: new Date().toISOString()
    };

    // حفظ الملف
    const configDir = path.join(__dirname, '..', 'config', 'shops');
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }

    const configPath = path.join(configDir, `${shopId}.json`);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log('\n✓ تم إنشاء ملف التكوين بنجاح!');
    console.log(`\nالملف: ${configPath}`);
    console.log(`\nمعرف المحل: ${shopId}`);
    console.log(`Package Name: ${appId}`);

    console.log('\n⚠ ملاحظات مهمة:');
    console.log('1. قم برفع شعار المحل إلى:');
    console.log(`   ${config.logo}`);
    console.log(`   ${config.splashLogo}`);
    console.log('\n2. لبناء التطبيق، استخدم:');
    console.log(`   node scripts/build-shop.js ${shopId}`);

    console.log('\n✓ جاهز للبناء!\n');

    rl.close();
}

generateConfig().catch(error => {
    console.error('✗ حدث خطأ:', error.message);
    rl.close();
    process.exit(1);
});
