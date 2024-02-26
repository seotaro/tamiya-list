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
          .split(' ');
        return [str[0], str.slice(1).join(' ')]
      })(item_title_block_);

      const en = ((element) => {
        const spans = element.querySelectorAll('span');
        const str = spans[1].textContent
          .replace(/\n/g, '')
          .replace(/LACQUER PAINT /ug, '')
          .split(' ');
        return [str[0], str.slice(1).join(' ')]
      })(item_title_block_);

      return { code: ja[0], name: { ja: ja[1], en: en[1] } };
    })
}

(async () => {
  const END_POINT = 'https://www.tamiya.com/japan/products/';

  const items = [
    ...Array.from({ length: 99 }, (_, i) => 82101 + i),
  ];

  const list = [];

  // サーバー側の付加を考えて愚直に順番にスクレイピングする
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // 例外処理
    if (item === 82110) {
      const res = { code: 'LP-10', name: { ja: 'ラッカー溶剤 （10ml）', en: 'LACQUER THINNER (10ml)' } };
      list.push({ item, ...res });
      console.log(`${item}, ${res.code}, ${res.name.ja}, ${res.name.en}`);
      continue;
    }

    try {
      const res = await parse(`${END_POINT}/${item}/index.html`, item);
      list.push({ item, ...res });
      console.log(`${item}, ${res.code}, ${res.name.ja}, ${res.name.en}`);

    } catch (e) {
      console.log(`${item}: ${e.message}`);
    }
  }

  const json = JSON.stringify(list);
  fs.writeFileSync('list-lacquer-paint.json', json, 'utf8');

  console.log('write list-lacquer-paint.json');
})();