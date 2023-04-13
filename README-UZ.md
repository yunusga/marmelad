[ci-img]:  https://travis-ci.org/solversgroup/marmelad.svg
[ci]:      https://travis-ci.org/solversgroup/marmelad

# marmelad

[![npm](https://img.shields.io/npm/v/marmelad.svg)](https://www.npmjs.com/package/marmelad) [![npm](https://img.shields.io/npm/dt/marmelad.svg)](https://www.npmjs.com/package/marmelad) [![License](https://img.shields.io/github/license/solversgroup/marmelad)](https://github.com/solversgroup/marmelad/blob/main/LICENSE) ![since Wed Feb 24 08:39:42 2016 +0500](https://img.shields.io/badge/since-Wed%20Feb%2024%2008%3A39%3A42%202016%20%2B0500-blue)

<img src="marmelad.svg?sanitize=true" align="right" title="Marmelad logo made by Jelly beans from www.flaticon.com is licensed by CC 3.0 BY" width="100" height="100">


[RU](README.md), UZ 



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
  - [`mv <oldName> <newName> [options]` blok nomini o'zgartirish](#mv-oldname-newname-options-blok-nomini-ozgartirish)
  - [`lint`](#lint-w3c-validator)
  - [`dist` vazifalarni chiqarish](#dist-vazifalarni-chiqarish)
  - [`pack [name] [options]` loyihani arxivlash](#pack-name-options-loyihani-arxivlash)
- [Marmelad TCI](#marmelad-tci)
- [Loyiha tuzilishi](#loyiha-tuzilishi)
- [Shablonlar/bloklar](#shablonlarbloklar)
  - [Lag'mon](#lagmon)
- [Shablonlar/bloklar uchun ma'lumotlar](#shablonlar-bloklar-uchun-ma'lumotlar)
  - [`incw` kengaytma](#incw-kengaytma)
- [Uslublar to'plami](#uslublar-toplami)
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


### `mv <oldName> <newName> [options]` blok nomini o'zgartirish

Blokning nomini va blok fayllari ichida blok nomining barcha takrorlanishini o'zgartirish uchun buyruq `.tci` faylida mavjud.


```bash
# blok fayllar nomini o'zgartirish
mv old-block-name new-block-name

# blok fayllari va blok fayllari ichidagi barcha o'zgarishlar nomini o'zgartirish
mv old-block-name new-block-name --hard

# fayllardagi  o'zgarishlarni ko'rish 
mv old-block-name new-block-name --dry --hard
```

### `lint` W3C validator

Tayyor bo'lgan loyihada W3C validatorni ishga tushirish.

> W3C validator faqat loyiha tayyor bo'lganidan keyin ishga tushirilishi kerak, aks holda tekshirish natijalari noto'g'ri bo'ladi.

```bash
mmd dev --build && mmd lint
```


### `dist` vazifalarni chiqarish

> Eksperimental buyruq, hali hech qanday variantni o'tkazib bo'lmaydi. Faqat loyihaning yakuniy fayllari bilan ishlaydi, manba kodi hech qanday tarzda ta'sir qilmaydi.

- yeg'ish papkasidagi loyiha sahifalarining HTML kodini formatlash (`static`)
- JS/CSS fayllarini siqish va ularni HTML shablonlarida siqilganlar bilan almashtirish (`.min` nomida bo'lmagan fayllar siqiladi)
- Keshni qayta o'rnatish uchun kiritilgan fayllar uchun xeshlarni o'rnatish
- HTML elementlarining atributlarini saralash

```bash
mmd dev --build && mmd dist
```


### `pack [name] [options]` loyihani arxivlash

Loyiha fayllarini **tgz** yoki **zip** arxiviga joylashtiradi.

- `pack` **tgz** arxiv
- `pack -z, --zip` **zip** arxiv
- `pack -f, --folders [marmelad,static]` faqat ma'lum kataloglarni arxivga to'plang
- `pack --nodt` arxiv nomidagi yaratilgan sana va vaqtni almashtirmang (odatiy bo'yicha o'chirilgan)
- `pack custom-name` arxiv uchun maxsus nom, aks holda arxiv nomi loyihaning asosiy papkasidan olinadi.

```bash
pack           # project_11072019-153012.tgz
pack my-name   # my-name_11072019-153012.tgz
pack -z        # project_11072019-153012.zip
pack -f static # project_11072019-153012.tgz faqat static katalog
pack --nodt    # project.tgz sarlavhada sana va vaqt ko'rsatilmagan (odatiy bo'yicha o'chirilgan)
```


## Marmelad TCI

TCI (text command interface) - tartib shabloniga qo'shiladi va CLI buyruqlarini **marmelad** (`cp`, `cb`), takrorlaydi, ya'ni boshqa konsol/terminalga o'tishning hojati yo'q va u erda allaqachon qo'shimcha ishlarni amalga oshiradi.

Endi buning uchun **.tci** fayli mavjud, barcha buyruqlar `mmd` yoki `marmelad` prefikslarisiz kiritiladi.


## Loyiha tuzilishi

```bash
├─ marmelad
│  ├─ _blocks                   # bloklar
│  │   └─ some-block            # misol bloki
│  │       ├─ some-block.html   # blok namunasi
│  │       ├─ some-block.js     # blok skriptlari
│  │       ├─ some-block.styl   # blok stillari
│  │       └─ some-block.json   # blok ma'lumotlari
│  ├─ _pages                    # sahifalar
│  ├─ iconizer                  # SVG-ikonka SVG-piktogramma
│  │   ├─ colored               # ranglar SVG-ikonkalar
│  │   └─ icons                 # monoxrom SVG-ikonkalar
│  ├─ snippets                  # tahrir uchun BEML parchalari
│  ├─ static                    # verstka uchun statik
│  ├─ styles                    # stil, styl yoki scss
│  ├─ .editorconfig             # muharrir uchun konfiguratsiya
│  ├─ .tci                      # TCI buyruqlari marmelad
│  ├─ data.marmelad.js          # global ma'lumotlar
│  └─ settings.marmelad.js      # yeg'ish sozlamalari
└─ static                       # yakuniy yig'ilish
```


## Shablonlar/bloklar

- shablon dvigateli [nunjucks](https://mozilla.github.io/nunjucks/)
- HTMLda BEM nomlanishini ta'minlaydi [posthtml-bem](https://www.npmjs.com/package/posthtml-bem)




### Lag'mon

Ko'p sahifali yirik loyihalarda HTML shablonlarini yig'ishni optimallashtirish uchun mo'ljallangan.

**Lag'mon** Bloklardan yoki sahifalardan bloklardan sahifalarning havolalarini/bog'liqlarini quradi. Bu shablon mexanizmiga qaysi sahifalar uchun blok o'zgarganligini tushunishga va faqat u ishlatiladigan sahifalarning HTML-ni qayta qurishga imkon beradi.

Modulning to'g'ri ishlashi uchun bloklar va sahifalarni yig'ish qoidalariga qat'iy rioya qilish kerak.

Talab qilinadigan atributga ega bo'lgan BEM belgisini **Blok o'z ichiga olishi kerak** `block`:

```html
<div block="block-name" mods="red">
  ...
</div>
```

Ushbu atribut sahifa va blok o'rtasida aloqa o'rnatish imkonini beradi. Agar ushbu atribut blok belgisida bo'lmasa, bu blok avtomatik ravishda o'zgarishlarni kuzatish ro'yxatidan chiqariladi va u ishlatiladigan sahifalarni qayta tiklashni to'xtatadi.



## Shablonlar/bloklar uchun ma'lumotlar

Blok uchun ma'lumotlar shablonlarda blok nomi ko'rsatilgan kalit bo'yicha (agar blok uchun ma'lumotlar fayli yaratilgan bo'lsa va hech bo'lmaganda biror narsa bilan to'ldirilgan bo'lsa) yoki "data.marmelad.js" (global ma'lumotlar) dan mavjud. Blokning o'z ma'lumotlarining nomlari/kalitlari o'zgartiriladi **camelCase**.



### `incw` kengaytma

`incw` - ushbu kengaytma blok fayl kengaytmasini ko'rsatmasdan, shablonga individual ma'lumotlarni uzatish bilan blok shablonlarini ulash imkonini beradi.

```nunjucks
{# shablonga ma'lumotlarni qo'lda kiritish #}
{% incw 'kengaytmasiz shablon nomi', {title: 'Example', subtitle: 'An example component'} %}

{# o'zgaruvchidan shablonga ma'lumotlarni uzatish #}
{% incw 'kengaytmasiz shablon nomi', app.lang %}
```

`incw`ga uzatilgan ma'lumotlar shablon ichida `_ctx` tugmasi yordamida mavjud.

```nunjucks
{# shablon ulanishi #}
{% incw 'avatar', { image: 'IMAGE URL', name: 'USERNAME'} %}

{# shablonda #}
<div block="incw-template">
  <img src="{{ _ctx.image }}" alt="">
  <span>{{ _ctx.name }}</span>
</div><!-- incw-template -->
```

> Ichki `incw` asosiy blokning `_ctx` ni olmaydi, faqat global ma'lumotlarni oladi. Muayyan ma'lumotlarni ichki `incw` ga o'tkazish uchun ma'lumotlarni aniq `incw` ga o'tkazishingiz kerak.


## Uslublar to'plami

Qo'llab-quvvatlovchilarni yaratish `stylus`, `scss`, `sass`.


### Post CSS plaginlari

- [autoprefixer](https://www.npmjs.com/package/autoprefixer)
- [postcss-easing-gradients](https://www.npmjs.com/package/postcss-easing-gradients)
- [postcss-flexbugs-fixes](https://www.npmjs.com/package/postcss-flexbugs-fixes)
- [postcss-inline-svg](https://www.npmjs.com/package/postcss-inline-svg)
- [postcss-momentum-scrolling](https://www.npmjs.com/package/postcss-momentum-scrolling)
- [postcss-sort-media-queries](https://github.com/solversgroup/postcss-sort-media-queries)


## Iconizer

Iconizer qanday ulanishi va shablonlarda ishlatilishi nuqtai nazaridan o'zgarishlarga duch keldi.

### Iconizerdan foydalanish

**Shablonda**

```HTML+Django
{{ _icon('marmelad', { tag: 'span' }) }}
```

**Chiqishda**

```HTML
<span class="svg-icon svg-icon--marmelad colored" aria-hidden="true" focusable="false">
  <svg class="svg-icon__link">
    <use xlink:href="#marmelad"></use>
  </svg>
</span>
```

### Iconizer parametrlari

```HTML+Django
{{ _icon('<name>', {
  tag: 'div',
  type: 'icons',
  class: '',
  mode: 'inline',
  url: '',
}) }}
```

`settings.marmelad.js -> iconizer` dan `icon` funksiyasi **nunjucks** shablon mexanizmiga `_icon` sifatida uzatiladi.

### SVG sprite turlari

- `icons` - monoxrom piktogramma, barcha keraksiz dizayn atributlari olib tashlangan
- `colored` - rangli piktogrammalarda faqat `title` tegi olib tashlanadi

### Rangli SVG belgisidan foydalanishga misol

Rangli belgini kiritish uchun `type="colored" ` atributini qo'shing

```HTML+Django
{{ _icon('marmelad', { type: 'colored' }) }}
```

### SVG sprite ulanish rejimlari

- `inline` - sprayt sahifaning HTML kodiga kiritilgan
- `external` - joylashuvi URL manziliga kirish orqali alohida fayl sifatida ishlatiladi

### Iconizer 5+ uchun migratsiya

В `settings.marmelad.js`, olib tashlanishi kerak:

- `paths.iconizer`
- `app.svgSprite`

```js
const paths = {
  // удалить
  iconizer: {
    ...
  },
};

const app = {
  // удалить
  svgSprite: {
    ...
  },
};
```

`settings.marmelad.js` ga yangi ob'ekt qo'shing

```js
const iconizer = {
  cssClass: 'main-svg-sprite',
  mode: 'inline', // external отдельный подключаемый файл спрайта (default:inline)
  dest: path.join(paths.dist, 'img'), // путь для собираемых спрайтов
  url: 'img', // путь до подключаемого спрайта iconizer.dest без paths.dist
  srcIcons: path.join(folders.marmelad, folders.iconizer.src, 'icons'),
  srcColored: path.join(folders.marmelad, folders.iconizer.src, 'colored'),
  icon: (name, opts) => {
    opts = Object.assign({
      tag: 'div',
      type: 'icons',
      class: '',
      mode: 'inline',
      url: '',
    }, opts);

    let external = '';
    let typeClass = '';

    if (opts.mode === 'external') {
      external = `${opts.url}/sprite.${opts.type}.svg`;
    }

    if (opts.type !== 'icons') {
      typeClass = ` svg-icon--${opts.type}`;
    }

    opts.class = opts.class ? ` ${opts.class}` : '';

    return `
      <${opts.tag} class="svg-icon svg-icon--${name}${typeClass}${opts.class}" aria-hidden="true" focusable="false">
        <svg class="svg-icon__link">
          <use xlink:href="${external}#${name}"></use>
        </svg>
      </${opts.tag}>
    `;
  },
  plugin: {
    mode: {
      symbol: { // symbol mode to build the SVG
        example: false, // Build sample page
      },
    },
    svg: {
      xmlDeclaration: false, // strip out the XML attribute
      doctypeDeclaration: false, // don't include the !DOCTYPE declaration
    },
  },
};
```

va uni sozlamalar eksportiga qo'shishni unutmang

```js
module.exports = {
  // qo'shish
  iconizer,
};
```

## `latencyRoutes` serveri tomonidan kontentni taqdim etishda kechikish

`settings.marmelad.js app.bsSp` da kontentni server tomonidan qaytarishni kechiktirish uchun sozlamalarni qo'shishingiz kerak.

```js
// masalan, yangi loyihalar uchun /api uchun standart kechikish
latencyRoutes: [
  {
    route: '/css',
    latency: 3000,
    active: true,
  },
],
```

## Litsenziya

[MIT](LICENSE)

## A'zoning axloq kodeksi

[A'zoning axloq kodeksi](CODE_OF_CONDUCT_UZ
) o'qib chiqing

*Logotip muallifning piktogrammasidan olingan va o'zgartirilgan <a href="https://www.flaticon.com/authors/freepik" title="Jelly beans">Jelly beans</a> litsenziya asosida tarqatiladi <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a> с <a href="https://www.flaticon.com/"     title="Flaticon">www.flaticon.com</a>*

[Boshiga 🔝](#marmelad)
