#!/usr/bin/env node

/**
 * Build All Shops Script
 * يبني تطبيقات لجميع المحلات المسجلة
 * 
 * الاستخدام:
 * node scripts/build-all.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function buildAllShops() {
    const startTime = Date.now();

    log('\n╔═══════════════════════════════════════╗', 'cyan');
    log('║   بناء جميع تطبيقات المحلات         ║', 'cyan');
    log('╚═══════════════════════════════════════╝\n', 'cyan');

    // قراءة جميع ملفات التكوين
    const configDir = path.join(__dirname, '..', 'config', 'shops');

    if (!fs.existsSync(configDir)) {
        log('✗ مجلد التكوينات غير موجود', 'red');
        log(`يرجى إنشاء: ${configDir}`, 'yellow');
        process.exit(1);
    }

    const configFiles = fs.readdirSync(configDir).filter(f => f.endsWith('.json'));

    if (configFiles.length === 0) {
        log('✗ لا توجد ملفات تكوين', 'red');
        process.exit(1);
    }

    log(`✓ تم العثور على ${configFiles.length} محل\n`, 'green');

    const results = {
        success: [],
        failed: []
    };

    // بناء كل محل
    for (let i = 0; i < configFiles.length; i++) {
        const configFile = configFiles[i];
        const shopId = configFile.replace('.json', '');

        log(`\n[${i + 1}/${configFiles.length}] بناء: ${shopId}`, 'blue');
        log('─'.repeat(50), 'blue');

        try {
            execSync(`node scripts/build-shop.js ${shopId}`, { stdio: 'inherit' });
            results.success.push(shopId);
        } catch (error) {
            log(`✗ فشل بناء ${shopId}`, 'red');
            results.failed.push(shopId);
        }
    }

    // النتائج النهائية
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 60000).toFixed(2);

    log('\n\n╔═══════════════════════════════════════╗', 'cyan');
    log('║         ملخص عملية البناء            ║', 'cyan');
    log('╚═══════════════════════════════════════╝\n', 'cyan');

    log(`إجمالي المحلات: ${configFiles.length}`, 'blue');
    log(`✓ نجح: ${results.success.length}`, 'green');
    log(`✗ فشل: ${results.failed.length}`, results.failed.length > 0 ? 'red' : 'green');
    log(`⏱ الوقت الإجمالي: ${duration} دقيقة\n`, 'yellow');

    if (results.success.length > 0) {
        log('المحلات الناجحة:', 'green');
        results.success.forEach(shop => log(`  ✓ ${shop}`, 'green'));
    }

    if (results.failed.length > 0) {
        log('\nالمحلات الفاشلة:', 'red');
        results.failed.forEach(shop => log(`  ✗ ${shop}`, 'red'));
    }

    log('\n✓ اكتملت جميع عمليات البناء!', 'green');
    log(`الملفات في: builds/\n`, 'blue');
}

buildAllShops().catch(error => {
    log(`\n✗ حدث خطأ: ${error.message}`, 'red');
    process.exit(1);
});
