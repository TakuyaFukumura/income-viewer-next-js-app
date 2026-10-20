# SonarQube解析結果

## 実行概要

2026年10月20日に、Docker上のSonarQube Community Buildで解析しました。

| 項目 | 結果 |
| --- | --- |
| SonarQube | Community Build 26.9.0.129388 |
| SonarScanner | CLI 8.1.0.6389（Dockerイメージ `sonarsource/sonar-scanner-cli:latest`） |
| 対象 | `src/`、`lib/` |
| テスト | `__tests__/`（ソースコードから除外） |
| テストカバレッジ | 87.0%（SonarQube計測値） |
| 重複行率 | 0.0% |
| Quality Gate | OK |
| 未解決Issue | 17件（Bug 1件、Code Smell 16件） |
| 脆弱性 / Security Hotspot | 0件 / 0件 |

テストは8スイート、59件すべて成功しました。SonarQubeの脆弱性検出が0件であることは、セキュリティ監査全般で問題がないことを保証するものではありません。

## 対応候補

SonarQubeの重大度はルール上の分類です。特に `CRITICAL` はコードスメルの重大度であり、脆弱性や実行時障害を意味しません。動作への影響と現在の入力制約を確認してから対応してください。

| SonarQube重大度 | ファイル・行 | 指摘と対応候補 |
| --- | --- | --- |
| CRITICAL（Code Smell） | `src/app/components/income/IncomeSummary.tsx:13` | 関数の認知的複雑度が21（上限15）です。表示用の値・説明の決定を小さな関数に分けることを検討してください。 |
| CRITICAL（Code Smell） | `lib/income/parse-income-csv.ts:23` | CSV解析関数の認知的複雑度が24（上限15）です。検証処理を責務ごとに分割し、エラー文言と検証順序を維持できるかテストで確認してください。 |
| MAJOR（Bug） | `src/app/components/income/IncomeSummary.tsx:18` | `reduce()` に初期値がありません。直前に空配列を拒否するガードがあるため現状は空配列を処理しませんが、入力契約の変更に備えて初期値を渡すか、ガードとの関係をテストで固定してください。 |
| MAJOR（Code Smell） | `src/app/components/income/IncomeSummary.tsx:29, 31, 36, 41` | 入れ子の三項演算子が4箇所あります。条件分岐を名前付きの値や関数に分けると追いやすくなります。 |
| MAJOR（Code Smell） | `src/app/components/income/IncomeStackedBarChart.tsx:127, 143, 149` | `group` / `region` ロールと `tabIndex` に関するアクセシビリティ指摘です。スクロール領域のキーボード操作を維持したうえで、HTML要素・ARIAロールの組み合わせを支援技術で確認してください。 |
| MAJOR（Code Smell） | `src/app/components/income/IncomeStackedBarChart.tsx:175` | `Legend` のformatter内でJSXを生成しています。formatterをコンポーネント外の名前付き関数に切り出せるか検討してください。 |
| MINOR（Code Smell） | `src/app/components/income/IncomeSummary.tsx:13` | Propsを読み取り専用にする指摘です。 |
| MINOR（Code Smell） | `src/app/components/income/IncomeStackedBarChart.tsx:39, 79` | Propsを読み取り専用にする指摘です。 |
| MINOR（Code Smell） | `src/app/components/income/IncomeTable.tsx:8` | Propsを読み取り専用にする指摘です。 |
| MINOR（Code Smell） | `lib/income/parse-income-csv.ts:36` | Optional chainingを使った簡潔な判定が可能という指摘です。 |
| MINOR（Code Smell） | `src/app/components/income/IncomeStackedBarChart.tsx:176` | Rechartsの `verticalAlign` が非推奨という指摘です。利用中のRechartsバージョンでの代替APIを確認してください。 |

### 優先度の目安

1. 2箇所の認知的複雑度を下げ、入力検証と表示条件を読みやすくする。
2. `reduce()` の空配列ガードを含む前提をテストで明確にする。
3. グラフのARIA指摘は、既存のキーボード操作を損なわないよう実際のアクセシビリティを確認してから変更する。
4. Propsのreadonly化、Optional chaining、Rechartsの非推奨APIを低リスクの整理候補として扱う。

## 再解析方法（Windows PowerShell）

Docker Desktopを起動し、リポジトリのルートで実行します。初回起動後にSonarQubeへログインして管理者パスワードを設定し、解析用トークンを発行してください。トークンはリポジトリに保存せず、環境変数で渡します。

```powershell
docker run --detach --name income-viewer-sonarqube --publish 9000:9000 sonarqube:community
# http://localhost:9000 が利用可能になったら、SonarQubeで解析用トークンを発行
$env:SONAR_TOKEN = "<SonarQubeで発行したトークン>"

npm test -- --coverage --runInBand

docker run --rm `
  --volume "${PWD}:/usr/src" `
  --workdir /usr/src `
  --env SONAR_TOKEN `
  --add-host host.docker.internal:host-gateway `
  sonarsource/sonar-scanner-cli:latest `
  -Dsonar.host.url=http://host.docker.internal:9000 `
  -Dsonar.projectKey=income-viewer-next-js-app `
  -Dsonar.projectName=income-viewer-next-js-app `
  -Dsonar.sources=src,lib `
  -Dsonar.tests=__tests__ `
  -Dsonar.test.inclusions=**/*.test.ts,**/*.test.tsx `
  -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info `
  -Dsonar.sourceEncoding=UTF-8
```

解析後は `http://localhost:9000/dashboard?id=income-viewer-next-js-app` で結果を確認できます。終了時は必要に応じてコンテナを停止・削除します。

```powershell
docker stop income-viewer-sonarqube
docker rm income-viewer-sonarqube
```

## 対応進捗

対応候補は優先度の目安に沿って順番に確認します。各項目は、実装・既存テストまたは追加テストによる確認が済んだ時点で完了にします。

| 順序 | 対応項目 | 状態 |
| --- | --- | --- |
| 1 | `IncomeSummary` の複雑度、`reduce()` の初期値、入れ子の三項演算子 | 完了（対象テスト4件成功） |
| 2 | CSV解析関数の複雑度とOptional chaining | 完了（対象テスト16件成功） |
| 3 | グラフのARIAロール、スクロール領域、キーボード操作 | 確認済み（役割・フォーカス制御とキーボード操作をテスト。スクリーンリーダー実機確認は未実施） |
| 4 | Legend formatter と Recharts の非推奨 `verticalAlign` | 完了（グラフテスト3件成功） |
| 5 | コンポーネントPropsの読み取り専用化 | 完了（対象コンポーネント・Tooltip Propsをreadonly化） |
| 6 | 関連テスト・Lint・型チェックによる最終確認 | 完了（テスト60件成功、Lintエラーなし、型チェック成功） |

最終確認には `npm test -- --runInBand`、`npm run lint`、`npx tsc --noEmit` を使用しました。Lintには生成済み `coverage/lcov-report/block-navigation.js` の未使用 `eslint-disable` 警告が1件ありますが、エラーはありません。

対応後のSonarQube再解析は未実施です。再解析にはSonarQubeコンテナと `SONAR_TOKEN` が必要ですが、確認時点ではどちらも用意されていません。上記の実行概要と指摘件数は対応前の解析結果です。
