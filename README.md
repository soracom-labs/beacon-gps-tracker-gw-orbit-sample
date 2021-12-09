# Sample SORACOM Orbit WASM module of Beacon GPS tracker GW

ビーコン対応 GPS トラッカー GW 用 SORACOM Orbit WASM モジュールのサンプルです。

## 利用方法

[最新リリース](https://github.com/soracom-labs/beacon-gps-tracker-gw-orbit-sample/releases) の WASM ファイル (soralet-beacon-gps-tracker-optimized.wasm) をダウンロードし、SORACOM ユーザコンソールへ設定することで利用できます。
具体的な利用方法は [Getting Started: 位置情報を送信する | ビーコン対応 GPS トラッカー GW ユーザーガイド | SORACOM Users](https://users.soracom.io/ja-jp/guides/iot-devices/beacon-gps-tracker/send-location/#%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%A0%E3%81%AE%E3%83%80%E3%82%A6%E3%83%B3%E3%83%AD%E3%83%BC%E3%83%89) を参照してください。
WASM モジュールによって変換されたデータのフォーマットは [リファレンス: SORACOM Orbit を使用したフォーマットの変換 | ビーコン対応 GPS トラッカー GW ユーザーガイド | SORACOM Users](https://users.soracom.io/ja-jp/guides/iot-devices/beacon-gps-tracker/orbit/) を参照してください。

## 検証・開発方法

Development container と Visual Studio Code を組み合わせた方法は以下の通りです。

1. [開発者ガイド: WASM モジュール開発環境のセットアップ | SORACOM Orbit | SORACOM Users](https://users.soracom.io/ja-jp/docs/orbit/setup/#%E9%96%8B%E7%99%BA%E7%92%B0%E5%A2%83%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB) に従って orbit-development-environment.zip を任意のディレクトリに展開します。過去のバージョンからアップデートする際は新しいディレクトリへ展開してください。
2. 展開したディレクトリ内で当リポジトリを clone します。zip でダウンロードした場合は展開します。
3. `orbit-sdk-assemblyscript` と `beacon-gps-tracker-gw-orbit-sample` が同じディレクトリ内にあることを確認します。`beacon-gps-tracker-gw-orbit-sample-master` など、異なるディレクトリ名になっている場合は `beacon-gps-tracker-gw-orbit-sample` に名称を直してください。
4. `beacon-gps-tracker-gw-orbit-sample` ディレクトリを Visual Studio Code で開きます。
5. [開発者ガイド: WASM モジュール開発環境のセットアップ | SORACOM Orbit | SORACOM Users](https://users.soracom.io/ja-jp/docs/orbit/setup/#%E9%96%8B%E7%99%BA%E7%92%B0%E5%A2%83%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB) の「各言語共通 - 3」以降と同じ手順で検証・開発できます。

## 備考

当サンプルは orbit-development-environment-2020-11 の開発環境で実装されています。
