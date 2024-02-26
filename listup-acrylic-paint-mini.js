'use strict';

const { JSDOM } = require('jsdom');
const fs = require('fs');

const parse = (url) => {
  return fetch(url)
    .then(response => {
      if (response.status !== 200) {
        throw new Error(`failed to fetch ${response.status}, ${response.statusText}`);
      }
      return response.arrayBuffer();
    })
    .then(data => new TextDecoder('shift-jis').decode(data))
    .then(html => {
      const dom = new JSDOM(html);
      const document = dom.window.document;

      const item_title_block_ = document.querySelector('.item_title_block_');

      const ja = ((element) => {
        const h1 = element.querySelector('h1');
        const str = h1.textContent
          .replace(/\n/g, '')
          .replace(/アクリルミニ /ug, '').split(' ');
        return [str[0], str.slice(1).join(' ')]
      })(item_title_block_);

      const en = ((element) => {
        const spans = element.querySelectorAll('span');
        const str = spans[1].textContent
          .replace(/\n/g, '')
          .replace(/ACRYLIC PAINT MINI /gi, '').split(' ');
        return [str[0], str.slice(1).join(' ')]
      })(item_title_block_);

      return { code: ja[0], name: { ja: ja[1], en: en[1] } };
    })
}

(async () => {
  const END_POINT = 'https://www.tamiya.com/japan/products/';


  const items = [
    // 81030,  // アクリルミニ X20A　(大徳用)
    // 81040,  // アクリル溶剤特大(X-20A 250ml)
    ...Array.from({ length: 99 }, (_, i) => 81501 + i),// つやあり系
    ...Array.from({ length: 99 }, (_, i) => 81701 + i),// つや消し系
  ];

  const list = [];

  // サーバー側の付加を考えて愚直に順番にスクレイピングする
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      const res = await parse(`${END_POINT}/${item}/index.html`);
      list.push({ code: item, ...res });
      console.log(`${item}, ${res.code}, ${res.name.ja}, ${res.name.en}`);

    } catch (e) {
      console.log(`${item}: ${e.message}`);
    }
  }

  const json = JSON.stringify(list);
  fs.writeFileSync('list-acrylic-paint-mini.json', json, 'utf8');

  console.log('write list-acrylic-paint-mini.json');
})();