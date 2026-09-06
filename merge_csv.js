const fs = require('fs');
const path = require('path');

// 今日の日付を YYYYMMDD 形式で取得
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const dateStr = `${yyyy}${mm}${dd}`;

const CSV_DIR = path.join(__dirname, 'Csv');
const OUTPUT_FILE = path.join(__dirname, `data_${dateStr}.csv`);

function mergeCSVs() {
  if (!fs.existsSync(CSV_DIR)) {
    console.error(`エラー: "${CSV_DIR}" フォルダが見つかりません。`);
    return;
  }

  const files = fs.readdirSync(CSV_DIR)
    .filter(file => file.endsWith('.csv'))
    .sort();

  if (files.length === 0) {
    console.error("エラー: CSVファイルが見つかりませんでした。");
    return;
  }

  let combinedRows = [];
  let isFirstFile = true;
  let totalCounter = 1; // 全体通し番号のカウンター

  files.forEach(file => {
    const filePath = path.join(CSV_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8').trim();
    const lines = content.split(/\r?\n/);

    if (lines.length === 0) return;

    // 1つ目のファイルからヘッダー（1行目）を取得して追加
    if (isFirstFile) {
      combinedRows.push(lines[0]);
      isFirstFile = false;
    }

    // 2行目以降（データ行）の処理
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // カンマで分割して先頭の通し番号を書き換え
      const columns = line.split(',');
      columns[0] = totalCounter; // 先頭の番号を全体通し番号に置換
      
      combinedRows.push(columns.join(','));
      totalCounter++;
    }

    console.log(`結合完了: ${file}`);
  });

  fs.writeFileSync(OUTPUT_FILE, combinedRows.join('\n'), 'utf8');
  console.log(`\n統合成功: ${path.basename(OUTPUT_FILE)} を生成しました！（総問題数: ${totalCounter - 1}）`);
}

mergeCSVs();
