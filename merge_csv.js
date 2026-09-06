const fs = require('fs');
const path = require('path');

// 今日の日付を YYYYMMDD 形式で取得
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const dateStr = `${yyyy}${mm}${dd}`; // 例: 20260906

// CSVが入っているフォルダと出力ファイルの設定
const CSV_DIR = path.join(__dirname, 'Csv');
const OUTPUT_FILE = path.join(__dirname, `data_${dateStr}.csv`);

function mergeCSVs() {
  if (!fs.existsSync(CSV_DIR)) {
    console.error(`エラー: "${CSV_DIR}" フォルダが見つかりません。`);
    return;
  }

  // Csvフォルダ内の .csv ファイルを取得してソート（01_, 02_ の順に並べ替え）
  const files = fs.readdirSync(CSV_DIR)
    .filter(file => file.endsWith('.csv'))
    .sort();

  if (files.length === 0) {
    console.error("エラー: CSVファイルが見つかりませんでした。");
    return;
  }

  let combinedRows = [];
  let isFirstFile = true;

  files.forEach(file => {
    const filePath = path.join(CSV_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8').trim();
    const lines = content.split(/\r?\n/);

    if (lines.length === 0) return;

    if (isFirstFile) {
      // 最初のファイルはヘッダー（1行目）も含めて追加
      combinedRows.push(...lines);
      isFirstFile = false;
    } else {
      // 2つ目以降のファイルはヘッダー（1行目）を除外してデータのみ追加
      combinedRows.push(...lines.slice(1));
    }
    console.log(`結合完了: ${file}`);
  });

  // 結合した内容を日付付きファイル名で書き出し
  fs.writeFileSync(OUTPUT_FILE, combinedRows.join('\n'), 'utf8');
  console.log(`\n 統合成功: ${path.basename(OUTPUT_FILE)} を生成しました！`);
}

mergeCSVs();
