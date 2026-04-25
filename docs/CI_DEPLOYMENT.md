# CI/CD & デプロイ設定ガイド

このドキュメントでは、GitHub および GitLab を使用してステータスチェックの自動化とダッシュボードのデプロイを行う方法について説明します。

## GitHub Actions & GitHub Pages

GitHub Actions を使用して、ステータスチェックの実行とダッシュボードのデプロイを行います。

### 1. ワークフローの構成
ワークフローファイル（`.github/workflows/status-check.yml`）は、1回の実行で以下の3つの主要なタスクを行います：
1. **データの生成**: `npm run generate` を実行して `data/status.json` を更新します。
2. **変更のコミット**: 更新された JSON をリポジトリにプッシュし、履歴を保存します。
3. **Pages へのデプロイ**: ワークスペースをアーティファクトとしてアップロードし、デプロイを実行します。

### 2. 重要な設定
ダッシュボードを正しく更新するために、GitHub Pages のソース設定を必ず変更する必要があります：
1. リポジトリの **Settings** > **Pages** を開きます。
2. **Build and deployment** > **Source** で、**「GitHub Actions」** を選択します（「Deploy from a branch」ではありません）。

### 3. なぜ `[skip ci]` と `github-actions[bot]` を使うのか？
* **無限ループの防止**: GitHub Actions は、デフォルトの `GITHUB_TOKEN` によるプッシュでは新しいワークフローをトリガーしません。これは無限ループを防ぐためのセキュリティ機能です。
* **`[skip ci]`**: この自動コミットに対して CI を再実行する必要がないことを GitHub に明示的に伝えるために追加されています。
* **デプロイのタイミング**: ページは、Bot のコミットによってではなく、そのコミットを作成した「元のワークフロー」の後半ステップによってデプロイされます。そのため、Bot のコミット自体に実行アイコンが表示されなくても問題ありません。

---

## GitLab CI/CD & GitLab Pages

GitLab では `.gitlab-ci.yml` ファイルを使用してパイプラインを管理します。

### 1. デプロイの要件
* **ジョブ名**: デプロイを処理するジョブ名は必ず `pages` である必要があります。
* **アーティファクトディレクトリ**: GitLab Pages は `public` という名前のディレクトリを探します。このフォルダ内のすべてのファイルが Pages の URL で公開されます。

### 2. 運用パターン（アーティファクトベース）
GitHub の例とは異なり、GitLab の例では**アーティファクトベースのパターン**を使用しています：
1. `generate` ジョブが `data/status.json` を作成します。
2. `pages` ジョブがプロジェクト全体（新しい JSON を含む）を `public/` フォルダにコピーします。
3. GitLab が自動的に `public` アーティファクトをデプロイします。

*注: このパターンでは、更新された JSON はリポジトリにコミット（保存）されません。リポジトリに履歴を残したい場合は、Project Access Token を使用してブランチにプッシュする設定が必要です。*

### 3. GitLab UI での設定確認
GitLab 側で Pages を有効にし、URL を確認する手順は以下の通りです：
1. リポジトリの **Deploy** > **Pages** を開きます。
2. **Access control** が適切に設定されているか確認します（「Everyone」にすると公開されます）。
3. **Use unique domain** 設定により、デプロイ完了後に公開 URL が表示されます。
4. パイプラインが成功しても反映されない場合は、**Settings** > **CI/CD** > **Runners** で Shared Runners が有効になっているか確認してください。


### 3. 機能比較表

| 機能 | GitHub Actions | GitLab CI/CD |
| :--- | :--- | :--- |
| **トリガー** | `schedule`, `push`, `workflow_dispatch` | `schedules`, `push`, `web` |
| **Pages ソース設定** | Settings で "GitHub Actions" を選択必須 | `pages` というジョブ名で自動認識 |
| **データの永続化** | リポジトリにコミット (標準) | アーティファクトのみ (標準) |
| **Bot ユーザー** | `github-actions[bot]` | `gitlab-ci-token` |
| **ループ防止** | `GITHUB_TOKEN` は実行をトリガーしない | `[skip ci]` または専用ロジック |
| **公開URL確認** | Settings > Pages で確認 | Deploy > Pages で確認 |


## トラブルシューティング

### Q: Bot のコミット後にページが更新されません。
* **GitHub**: Pages のソースが "GitHub Actions" に設定されているか確認してください。"Branch" に設定されていると、Bot のプッシュでは自動更新されません。
* **GitLab**: `pages` ジョブが正常に終了し、`public/` ディレクトリに `index.html` が含まれているか確認してください。

### Q: チェックの頻度を変更したい。
ワークフローファイルの `cron` 設定を編集してください：
* GitHub: `cron: '*/15 * * * *'` (15分ごと)
* GitLab: GitLab UI (Build > Pipeline schedules) でスケジュールを設定します。
