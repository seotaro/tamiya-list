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
          .replace(/アクリルミニ |エナメル /ug, '')
          .split(' ');
        return [str[0], str.slice(1).join(' ')]
      })(item_title_block_);

      const en = ((element) => {
        const spans = element.querySelectorAll('span');
        const str = spans[1].textContent
          .replace(/\n/g, '')
          .replace(/ACRYLIC\s+(PAINT\s+)?MINI |LACQUER PAINT |LACQUER PAINT /gi, '')
          .split(' ');
        return [str[0], str.slice(1).join(' ')]
      })(item_title_block_);

      return { code: ja[0], name: { ja: ja[1], en: en[1] } };
    })
}

// 指定したアイテムNo.のリストを返す。
const getList = async (items) => {
  const END_POINT = 'https://www.tamiya.com/japan/products/';

  const list = [];

  // サーバー側の付加を考えて愚直に順番にスクレイピングする
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // 例外処理
    if (item === 81030) {
      const res = { code: 'X-20A', name: { ja: 'アクリル溶剤大徳用(40ml)', en: 'Acrylic thinner (40ml)' } };
      list.push({ item, ...res });
      console.log(`${item}, ${res.code}, ${res.name.ja}, ${res.name.en}`);
      continue;
    }
    if (item === 81040) {
      const res = { code: 'X-20A', name: { ja: 'アクリル溶剤特大(250ml)', en: 'Acrylic thinner (250ml)' } };
      list.push({ item, ...res });
      console.log(`${item}, ${res.code}, ${res.name.ja}, ${res.name.en}`);
      continue;
    }
    if (item === 80040) {
      const res = { code: 'X-20', name: { ja: 'エナメル溶剤特大(250ml)', en: 'Enamel thinner (250ml)' } };
      list.push({ item, ...res });
      console.log(`${item}, ${res.code}, ${res.name.ja}, ${res.name.en}`);
      continue;
    }
    if (item === 82110) {
      const res = { code: 'LP-10', name: { ja: 'ラッカー溶剤 （10ml）', en: 'LACQUER THINNER (10ml)' } };
      list.push({ item, ...res });
      console.log(`${item}, ${res.code}, ${res.name.ja}, ${res.name.en}`);
      continue;
    }

    try {
      const res = await parse(`${END_POINT}/${item}/index.html`);
      list.push({ item, ...res });
      console.log(`${item}, ${res.code}, ${res.name.ja}, ${res.name.en}`);

    } catch (e) {
      console.log(`${item}: ${e.message}`);
    }
  }

  return list;
}

// リストをCSV形式で出力する。
const outputCsv = (filename, list) => {
  let lines = 'item,code,name-ja,name-en\n';  // ヘッダー
  list.forEach(x => {
    lines += `${x.item},${x.code},${x.name.ja},${x.name.en}\n`;
  });

  fs.writeFileSync(`${filename}.csv`, lines, 'utf8');
};

module.exports = {
  getList,
  outputCsv,
};
