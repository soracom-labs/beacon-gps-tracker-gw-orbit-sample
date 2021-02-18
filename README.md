# Sample SORACOM Orbit WASM module of Beacon GPS tracker GW

ビーコン対応 GPS トラッカー GW 用 SORACOM Orbit WASM モジュールのサンプルです。

## 利用方法

[最新リリース](https://github.com/soracom-labs/beacon-gps-tracker-gw-orbit-sample/releases) の WASM ファイル (soralet-beacon-gps-tracker-optimized.wasm) をダウンロードし、SORACOM ユーザコンソールへ設定することで利用できます。
具体的な利用方法は [Getting Started for ビーコン対応 GPS トラッカー GW](https://dev.soracom.io/jp/beacon_gps_tracker/getting-started/) を参照してください。
WASM モジュールによって変換されたデータのフォーマットは[ビーコン対応 GPS トラッカー GW ユーザーガイド](https://dev.soracom.io/jp/beacon_gps_tracker/format-with-orbit/)を参照してください。

## 検証・開発方法

Development container と Visual Studio Code を組み合わせた方法は以下の通りです。

1. [WASM モジュール開発環境のセットアップ - 開発環境のインストール](https://dev.soracom.io/jp/orbit/setup/#setupdevenv) に従って orbit-development-environment.zip を任意のディレクトリに展開します。過去のバージョンからアップデートする際は新しいディレクトリへ展開してください。
2. 展開したディレクトリ内で当リポジトリを clone します。zip でダウンロードした場合は展開します。
3. `orbit-sdk-assemblyscript` と `beacon-gps-tracker-gw-orbit-sample` が同じディレクトリ内にあることを確認します。`beacon-gps-tracker-gw-orbit-sample-master` など、異なるディレクトリ名になっている場合は `orbit-sdk-assemblyscript` に名称を直してください。
4. `beacon-gps-tracker-gw-orbit-sample` ディレクトリを Visual Studio Code で開きます。
5. [WASM モジュール開発環境のセットアップ - 開発環境のインストール](https://dev.soracom.io/jp/orbit/setup/#setupdevenv) の「各言語共通 - 3」以降と同じ手順で検証・開発できます。

## 備考

当サンプルは orbit-development-environment-2020-11 の開発環境で実装されています。
