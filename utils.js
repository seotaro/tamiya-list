'use strict';

const fs = require('fs');

const outputCsv = (filename, list) => {
  // ヘッダー
  let lines = 'item,code,name-ja,name-en\n';

  list.forEach(x => {
    lines += `${x.item},${x.code},${x.name.ja},${x.name.en}\n`;
  });

  fs.writeFileSync(`${filename}.csv`, lines, 'utf8');
};

module.exports = {
  outputCsv,
};
