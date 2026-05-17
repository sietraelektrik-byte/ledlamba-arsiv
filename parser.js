const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs-extra');
const path = require('path');

const SITEMAP_URL = 'https://ledlamba.com/product-sitemap.xml';

async function generateSatellite() {
    try {
        console.log('WooCommerce ürün sitemapi çekiliyor...');
        const response = await axios.get(SITEMAP_URL, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });

        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(response.data);
        
        const urls = result.urlset.url;
        console.log(`${urls.length} adet ürün linki bulundu. Klasör yapısı hazırlanıyor...`);

        await fs.ensureDir('docs');
        await fs.ensureDir('docs/urun');

        let htmlList = '';
        
        for (const urlObj of urls) {
            const fullUrl = urlObj.loc[0];
            if (!fullUrl.includes('/urun/')) continue;

            const slug = fullUrl.split('/urun/')[1].replace(/\/$/, '');
            const productName = slug.replace(/-/g, ' ').toUpperCase();

            const productHtml = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${productName} - Sietra Elektrik LED Aydınlatma Arşivi</title>
    <meta name="description" content="${productName} teknik özellikleri, bağlantı şemaları ve energy verimliliği detayları.">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; }
        h1 { color: #0066cc; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .box { background: #f9f9f9; border-left: 4px solid #0066cc; padding: 15px; margin: 20px 0; }
        .backlink { font-weight: bold; font-size: 1.2rem; color: #ff6600; text-decoration: none; }
        .backlink:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>${productName}</h1>
    <p>Sietra Elektrik endüstriyel ve konutsal LED aydınlatma sistemleri veri tabanına hoş geldiniz. Bu sayfa, ilgili ürüne ait teknik altyapı ve arşiv kayıtlarını içermektedir.</p>
    
    <div class="box">
        <h3>🔍 Orijinal Ürün Sayfası ve Sipariş:</h3>
        <p>Güncel stok durumu, fiyat listesi ve toptan tedarik şartları için doğrudan resmi e-ticaret sitemizi ziyaret edin:</p>
        <a class="backlink" href="${fullUrl}" rel="dofollow" target="_blank">👉 ${productName} - LEDLAMBA RESMİ SİTESİ</a>
    </div>

    <p><strong>Teknik Etiket Bilgileri:</strong> Enerji verimliliği standartları, armatür lümen değerleri ve IoT/DALI sürücü entegrasyonu hakkında detaylı bilgi için teknik ekibimizle iletişime geçebilirsiniz.</p>
    <hr>
    <p><a href="../index.html">⬅️ Tüm Ürün Listesine Dön</a> | © 2026 Sietra Elektrik</p>
</body>
</html>`;

            await fs.writeFile(path.join('docs/urun', `${slug}.html`), productHtml.trim());
            htmlList += `<li><a href="./urun/${slug}.html">${productName}</a></li>\n`;
        }

        const indexHtml = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sietra Elektrik - LED Lamba Ürün Arşivi & SEO Uydu Sitesi</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; max-width: 900px; margin: 40px auto; padding: 0 20px; }
        h1 { color: #222; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
        a { color: #0066cc; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>Sietra Elektrik LED Aydınlatma Ürün Arşivi</h1>
    <p>ledlamba.com bünyesindeki tüm profesyonel aydınlatma armatürleri, projektörler ve endüstriyel sistemlerin statik indeks listesidir.</p>
    <hr>
    <ul>
        ${htmlList}
    </ul>
</body>
</html>`;

        await fs.writeFile('docs/index.html', indexHtml.trim());
        console.log('SEO Uydu Sayfaları Başarıyla Üretildi! (docs/ klasörüne kaydedildi)');

    } catch (error) {
        console.error('Hata oluştu:', error.message);
        process.exit(1);
    }
}

generateSatellite();
