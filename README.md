# Зангилаа: IT үйлчилгээний сайт

Байгууллагын сүлжээ, Starlink, камер, сервер, вэбсайтын захиалга авах хоёр хэлтэй (МН/EN) сайт.
Захиалга Telegram руу шууд ирнэ. Гадны npm dependency байхгүй.

- `/` монгол, `/en/` англи
- `/examples/<салбар>/` 7 салбарын жишээ сайт (site-factory загвараас)
- `/api/order` захиалга хүлээн авч Telegram руу илгээх serverless функц
- `brand/` лого (SVG), Facebook профайлын зураг (PNG)

## Орон нутагт харах

```bash
npm test                  # 9 тест
npm run preview           # http://localhost:5173 (захиалга консолд хэвлэгдэнэ)
```

## 1. Telegram бот үүсгэх (5 минут)

1. Telegram-аас **@BotFather** хайж `/newbot` бичнэ. Нэр (`Зангилаа захиалга`), username (`zangilaa_order_bot` гэх мэт) өгнө.
2. Өгсөн **token**-оо хадгална. Үүнийг хэнд ч, чатад ч бүү явуул.
3. Шинэ ботоо нээгээд **Start** дарж, ямар нэг мессеж бичнэ.
4. Хөтчөөр `https://api.telegram.org/bot<TOKEN>/getUpdates` нээнэ. Гарсан JSON-оос `"chat":{"id":123456789` гэсэн тоог олно. Энэ бол **chat id**.

## 2. Vercel дээр байршуулах

1. GitHub дээр шинэ репо үүсгээд энэ кодыг push хийнэ.
2. https://vercel.com → **Add New → Project** → репогоо сонгоно. Тохиргоог өөрчлөх шаардлагагүй (`vercel.json`-д бүгд бий).
3. **Project Name**-ийг `zangilaa` гэж өгвөл хаяг `zangilaa.vercel.app` болно (завгүй бол өөр нэр).
4. **Environment Variables**:
   - `TELEGRAM_BOT_TOKEN` = BotFather-ийн token
   - `TELEGRAM_CHAT_ID` = дээрх chat id
   - `SITE_URL` = `https://zangilaa.vercel.app` (эсвэл дараа нь өөрийн домэйн)
5. **Deploy**. Цаашид `git push` хийх бүрт автоматаар шинэчлэгдэнэ.
6. Сайтаас туршилтын захиалга илгээж Telegram-д ирж байгааг шалгана.

Environment variable өөрчилсний дараа **Redeploy** хийх шаардлагатай.

## 3. Домэйн авсны дараа

Vercel → Project → Settings → Domains → `zangilaa.mn` нэмээд, домэйн бүртгэгчийнхээ DNS-д Vercel-ийн заасан бичлэгийг оруулна. `SITE_URL`-ийг шинэчлээд Redeploy хийнэ.

## Засах газрууд

| Юу | Файл |
|---|---|
| Бүх текст, үнэ, туршлага (МН/EN) | `src/content.mjs` |
| Утас, имэйл | `src/content.mjs` → `CONTACT` |
| Өнгө, фонт, бүтэц | `assets/styles.css` (эхэнд `:root`) |
| Лого | `src/logo.mjs` |
| Нүүрний сүлжээний схем | `src/graphics.mjs` |
| Жишээ сайтын нэрс | `build.mjs` → `NAMES` |

Бодит ажлын зургууд бэлэн болмогц `assets/`-д хийж, үйлчилгээний хэсэгт нэмнэ. Интернэтээс авсан зураг бүү ашигла: зохиогчийн эрх зөрчих, харилцагч эсрэг хайлтаар олох эрсдэлтэй.

## Аюулгүй байдал

- CSP: зөвхөн өөрийн скрипт, inline script байхгүй (тест шалгадаг)
- Захиалга: Origin шалгалт, honeypot, rate limit, урт/тэмдэгтийн шүүлт
- Telegram-д `parse_mode` ашиглахгүй тул хэрэглэгчийн текстээр мессежийг хэлбэржүүлэх боломжгүй
- Token зөвхөн Vercel-ийн environment variable-д; кодод болон git-д хэзээ ч орохгүй
- HSTS, nosniff, Referrer-Policy, Permissions-Policy (`vercel.json`)
