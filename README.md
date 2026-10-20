# income-viewer-next-js-app

給与収入、配当金、その他の手取り収入を年ごとに可視化するNext.jsアプリケーションです。
2016年から2025年までの架空のサンプルデータを、積み上げ棒グラフとデータ表で確認できます。

## 主な機能

- 給与・配当金・その他を年別の積み上げ棒グラフで表示
- 金額は円で保持し、グラフ・表では万円単位、小数点以下1桁で表示
- グラフには項目別の凡例、操作可能なツールチップ、年合計ラベルを表示
- グラフと同じ値をセマンティックな表でも提供
- スマートフォンでの横スクロール、キーボード操作、スクリーンリーダーに対応
- ライトモードとダークモードを切り替え可能

## データ

サンプルデータは `data/income.csv` にあります。UTF-8のCSVで、ヘッダーと列順は次のとおりです。

```csv
year,salary,dividends,other
```

金額は税引後の円単位整数です。値はすべて架空のものです。CSVを読み込む際に列構成、年の範囲と順序、金額、合計値を検証し、不正なデータがあればファイル全体を拒否してエラーを表示します。

CSVはサーバー側で要求ごとに読み込まれます。開発中の変更は次の要求から反映されます。本番環境にリポジトリ内CSVの変更を反映するには再デプロイが必要です。

## 技術スタック

- Next.js App Router、React、TypeScript
- Tailwind CSS
- Recharts（グラフ描画）
- csv-parse（サーバー側CSV解析）
- Jest、React Testing Library、ESLint

## 開発

### 前提条件

- Node.js 26.x以上
- npm

### セットアップと起動

```bash
npm install
npm run dev
```

ブラウザーで [http://localhost:3000](http://localhost:3000) を開きます。

### 検証

```bash
npm test -- --runInBand
npm run lint
npx tsc --noEmit
npm run build
```

SonarQubeのローカル解析結果と再解析手順は[こちら](docs/sonarqube-analysis.md)を参照してください。

## 主なファイル

```text
data/income.csv
lib/income/
  format.ts
  parse-income-csv.ts
  repositories/
src/app/
  components/income/
  page.tsx
  layout.tsx
docs/
  要件定義書.md
  設計書.md
```

データ取得は `IncomeRepository` を通じて行い、初回リリースではCSVリポジトリを使用します。ファイルシステムへのアクセスはサーバー側に限定し、グラフの表示・操作だけをクライアントコンポーネントで行います。

## CI/CDと依存関係更新

GitHub ActionsでLint、型チェック、テスト、ビルドを実行します。依存関係の更新には[Dependabot](https://docs.github.com/ja/code-security/dependabot)を利用します。設定は `.github/dependabot.yml` を参照してください。
