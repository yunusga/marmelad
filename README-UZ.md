[ci-img]:  https://travis-ci.org/solversgroup/marmelad.svg
[ci]:      https://travis-ci.org/solversgroup/marmelad

# marmelad

[![npm](https://img.shields.io/npm/v/marmelad.svg)](https://www.npmjs.com/package/marmelad) [![npm](https://img.shields.io/npm/dt/marmelad.svg)](https://www.npmjs.com/package/marmelad) [![License](https://img.shields.io/github/license/solversgroup/marmelad)](https://github.com/solversgroup/marmelad/blob/main/LICENSE) ![since Wed Feb 24 08:39:42 2016 +0500](https://img.shields.io/badge/since-Wed%20Feb%2024%2008%3A39%3A42%202016%20%2B0500-blue)

<img src="marmelad.svg?sanitize=true" align="right" title="Marmelad logo made by Jelly beans from www.flaticon.com is licensed by CC 3.0 BY" width="100" height="100">


[RU](README), UZ 



Web dasturlash sohasida tajribaga ega yoki bu sohani endigina o'rganayotganlar uchun front-end loyihasini tayyorlash moduli. Fayl tuzilishi va loyiha ma'lumotlarini tartibga solishda "BEM" yondashuvi tufayli jamoada yagona loyiha tuzilmasini saqlash va loyihalar o'rtasida tayyor bloklarni boshqa bloklar ichida osongina qayta ishlatishni qo'llab quvvatlaydi.

Marmelad modullari bir marta o'rnatiladi va faqat uni yangilanib boriladi, ya'ni har bir loyiha uchun bir nechta npm bog'liqliklarini o'rnatishning hojati yo'q. Natijada, disk hotirasini tejash va internetsiz loyihalarni yaratish va qayta ishlash imkoniyatini beradi.


## Tarkibi

- [O'rnatish](#ornatish)
  - [MacOS va Linux uchun global modullarni o'rnatishdagi muammolar](#macos-va-linux-uchun-global-modullarni-ornatishdagi-muammolar)
  - [npm orqali](#npm-orqali-ornatish)
  - [Dasturchilar uchun](#dasturchilar-uchun-ornatish)
  - [Muayyan loyihalar uchun](#muayyan-loyihalar-uchun-ornatish)
- [Marmelad CLI](#marmelad-cli)
  - [`init [options]` ishga tushirish](#init-options-ishga-tushirish)
  - [`dev [options]` to'plamlarni ishga tushirish](#dev-options-toplamlarni-ishga-tushirish)
  - [`cp <name>` sahifa yaratish](#cp-name-sahifa-yaratish)
  - [`cb <name> [options]` blok yaratish](#cb-name-options-blok-yaratish)
  - [`mv <oldName> <newName> [options]` blok nomini o'zgartirish](#mv-oldName-newName-options-blok-nomini-o'zgartirish)
  - [`lint`](#lint-w3c-валидатор)
  - [`dist` vazifalarni chiqarish](#dist-vazifalarni-chiqarish)
  - [`pack [name] [options]` loyihani arxivlash](#pack-name-options-loyihani-arxivlash)
- [Marmelad TCI](#marmelad-tci)
- [Loyiha tuzilishi](#loyiha-tuzilishi)
- [Shablonlar/bloklar](#shablonlarbloklar)
  - [Lagman](#lagman)
- [Shablonlar/bloklar uchun ma'lumotlar](#shablonlar-bloklar-uchun-ma'lumotlar)
  - [`incw` kengaytma](#incw-kengaytma)
- [Uslublar to'plami](#uslublar-to'plami)
  - [Post CSS plaginlari](#post-css-plaginlari)

## Diqqat 

> [node-w3c-validator](https://www.npmjs.com/package/node-w3c-validator) ishlashi uchun [java](https://java.com) ni o'rnatishingiz kerak.

## O'rnatish

> Windows-dan Linux-ga yeg'uvchi fayllarni nusxalash orqali marmeladni o'rnatishga urinmang.Turli xil operatsion tizimlar uchun modullar o'rnatilgan.   Mavjud o'rnatish usullaridan foydalaning.

### MacOS va Linux uchun global modullarni o'rnatishdagi muammolar

Odatda, npm paketlarni loyihalaringizda "local" sifatida o'rnatadi. Oʻrnatish paketlarini "global" miqyosda ham oʻrnatishingiz mumkin (masalan, npm   install -g <package>) (buyruqlar qatori ilovalari uchun foydali). Biroq, buning salbiy tomoni shundaki, siz global miqyosda o'rnatishingiz uchun     root bo'lishingiz kerak (yoki sudo dan foydalaning).

Global modullarni oʻrnatish boʻyicha **NPM** qoʻllanmasini koʻrib chiqing. Paketlarni global miqyosda oʻrnatishda [Resolving EACCES permissions errors when installing packages globally](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)

### npm orqali o'rnatish

```bash
npm i marmelad -g
```

### Dasturchilar uchun o'rnatish

```bash
git clone https://github.com/solversgroup/marmelad.git
cd marmelad
npm i
npm link # sudo npm link для linux
```

### Muayyan loyihalar uchun o'rnatish

Ushbu turdagi o'rnatish mijoz loyiha fayllarini joylashtirish uchun ma'lum bir tuzilmani talab qilganda yoki assemblerning ishini loyiha   talablariga mos ravishda qayta ishlash kerak bo'lganda mos keladi. U yerda hamma narsa bo'lishi mumkin 😱.

 Muayyan loyihalar uchun o'rnatish, [dasturchilar uchun o'rnatish](#dasturchilar-uchun-ornatish)  bilan bir xil tarzda amalga oshiriladi, u faqat ishga tushirishda farq qiladi.

**marmelad** ishga tushirish va boshlash uchun siz  **marmelad** bajariladigan faylga yo'lni belgilashingiz kerak.

```bash
# node C:\marmelad\bin\marmelad.js
node <katalogni klonlash yo`li> '\bin\marmelad.js'
```

## Marmelad CLI

[npm orqali o'rnatish](#npm-orqali-ornatish) yoki  [dasturchilar uchun](#dasturchilar-uchun-ornatish) o'rnatilgandan so'ng, **marmelad** tizimingizning buyruq satrida ya'ni terminalida `marmelad` va `mmd` sifatida mavjud bo'ladi.

**marmelad** buyruqlari bo'yicha yordam olish uchun konsol/terminalga kiring:

```bash
# Parametrlarsiz
marmelad # yoki mmd
# или
marmelad --help # yoki mmd --help

Usage: marmelad [options] [command]

Web dasturlash sohasida tajribaga ega yoki bu sohani endigina o'rganayotganlar uchun loyihani tayyorlash 🤘

Options:
  -v, --version                     output the version number
  -h, --help                        display help for command

Commands:
  init [options] [dir]              initialize new project
  dev [options]                     run development server
  cp <name>                         create new page
  cb [options] <name>               create new block
  mv [options] <oldName> <newName>  rename block
  lint                              lint project
  dist                              Release tasks for project
  pack [options] [name]             Archive project source code (default:tar.gz)
  help [command]                    display help for command

Commands help:
  marmelad [command] --help
  mmd [command] --help

Source files:
  <marmelad installed directory>\marmelad\bin\marmelad.js
Version:
  <marmelad version>
```

### `init [options]` ishga tushirish

Ishga tushirish 3 bosqichda amalga oshiriladi:

1. O'tkazilgan argumentlarni hisobga olgan holda asosiy ish qismini nusxalash
2. Yordam fayllarini yangi loyihaning ildiziga nusxalash
3. Yangi loyihada git omborini ishga tushirish

Yangi loyihani ishga tushirish uchun `mmd init [options] [dir]` buyrug'idan foydalaning.

Agar ishga tushirish papkasining parametri ishga tushmasa, loyiha katalogi ochilib terminal orqali ishga tushiriladi.

`-c, --css` - yangi loyiha shablonini nusxalashda `settings.marmelad.js` ichidagi `app.css` kaliti qiymatini almashtiriladi. Keyinchalik bu kalit `settings.marmelad.js` da `app.css` kengaytmasi bilan  CSS fayllarini yaratish uchun `mmd cb` blokirovka buyrug`ini yaratish uchun ishlatiladi. **marmelad** ning joriy versiyasiga yangilangandan so‘ng, eski  loyihaga qo‘llab-quvvatlashni qo‘shish uchun “settings.marmelad.js” ichidagi “css” xususiyatini “app” obyektiga/ qiymati bilan qo‘shishingiz kerak.

`-t, --test` - faqat sinov uchun kerak, u loyihani ishlab chiqishda hech qanday ma'noga ega emas.

`[dir]` - belgilangan papkada loyihani ishga tushirish imkonini beradi. Masalan, `mmd init new-and-awesome -t scss`.



### `dev [options]` to'plamlarni ishga tushirish

> **Ogohlantirish !!!
 ** agar siz ishga tushirishni boshlashda `code: 'MODULE_NOT_FOUND'` xatosini ko‘rsangiz, katta ehtimol bilan **marmelad** katalogda oldindan [yaratilgan (`mmd init`)](#init-options-ishga-tushirish) ishga tushirilmoqda bo'sh **marmelad** loyihasida.

 - `dev` standart ishga tushirish
- `dev -a` server parol himoyasi bilan boshlanadi, login va parol avtomatik ravishda yaratiladi
- `dev -a <login>@<password>`server parol himoyasi bilan boshlanadi, login va parol qo'lda o'rnatiladi
- `dev --build` o'zgarishlarni kuzatish va qayta qurishni boshlamasdan loyihani bir martalik qurish
- `dev --proxy-mod` statik qurish rejimi + kerakli resurslarni (css, js) ishchi saytning ma'lum bir katalogiga nusxalash bilan jonli saytni proksi-server qilish

> `dev --proxy-mod` xato **Error: Missing positive glob** Bu konfiguratsiyada nusxa ko'chirish uchun kataloglarni ko'rsatmaganingizni anglatadi, odatiy izoh bo'yicha ular izohlanadi.


### `cp <name>` sahifa yaratish

Sahifa fayli `marmelad/_pages` katalogida yaratilgan, fayl nomida kengaytma belgilanmagan.


### `cb <name> [options]` blok yaratish

Blok fayllari `marmelad/_blocks` katalogida yaratilgan.

```bash
#.tci
cb new-block --t html,js
```
U barcha kerakli texnologiyalarni o'z ichiga olgan bir xil nomdagi blokni yaratadi.

```bash
# marmelad/_blocks
new-block
  ├─ new-block.html  # namuna
  └─ new-block.js    # skriptlar
```

`--t` opsiyasi aynan qaysi texnologiyalarni yaratishni belgilash imkonini beradi. Aslida, ushbu parametrda vergul bilan ajratilgan har qanday formatlar sonini ro'yxatga olish mumkin.

Stil formati ixtiyoriy, agar u ko'rsatilmagan bo'lsa, buyruq `settings.marmelad.js -> app.css` da ko'rsatilgan stil formatiga ega fayl yaratadi.
