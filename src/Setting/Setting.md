## 🔧 Setting

PCSプロトコルの設定周りに関するコンポーネントです。
PCSトークンの送信を行うTransfer、PCSトークンのパスワード復元・変更を行うPasswordの2つのコンポーネントと、それを1つにまとめたSettingコンポーネントの合計3つのコンポーネントからなります。

### 💸 Transfer

PCSトークンを送信するためのフォームコンポーネントです。

コンポーネントに渡す引数には

- symbol(任意) 対象とするトークンのシンボル 指定しない場合はSymbolを入力するためのフォームが現れ、ユーザーにシンボルを入力してもらう
- appName(任意) Scatterに表示されるアプリケーション名 指定しない場合はデフォルト値のPCS_APPとなります。
- theme(任意) コンポーネントのデザインテーマ THEMEをインポートしてDARK か WHITEのどちらかから選択してください。　指定しない場合はデフォルト値のDARKになります
- title(任意) コンポーネントのタイトルです。指定しない場合はデフォルト値の『💸 トークン送信』になります。
- network(**必須**) 利用するEOSノードの情報をまとめたオブジェクトです。EOS_NETWORKをインポートして利用するネットワークを選択してください。

```
import { Transfer, THEME, EOS_NETWORK } from "pcs-react"

<Transfer symbol={"TST"} appName={"PCS_TRANSEFER"} theme={THEME.DARK} title={"Transfer pcs token"} network={EOS_NETWORK.main.scatter} />
```

### 🔑 Password

PCSトークンのパスワードを変更・復元するためのフォームコンポーネントです。

コンポーネントに渡す引数には

- symbol(任意) 対象とするトークンのシンボル 指定しない場合はSymbolを入力するためのフォームが現れ、ユーザーにシンボルを入力してもらう
- appName(任意) Scatterに表示されるアプリケーション名 指定しない場合はデフォルト値のPCS_APPとなります。
- theme(任意) コンポーネントのデザインテーマ THEMEをインポートしてDARK か WHITEのどちらかから選択してください。　指定しない場合はデフォルト値のDARKになります
- title(任意) コンポーネントのタイトルです。指定しない場合はデフォルト値の『🔑 パスワード変更・再設定・復元』になります。
- network(**必須**) 利用するEOSノードの情報をまとめたオブジェクトです。EOS_NETWORKをインポートして利用するネットワークを選択してください。

```
import { Password, EOS_NETWORK } from "pcs-react"

<Password network={EOS_NETWORK.kylin.asia} />
```

### 🔨 Setting

PCSトークンの送信を行うTransfer、PCSトークンのパスワード復元・変更を行うPassword、2つのコンポーネントをまとめたコンポーネントです。

コンポーネントに渡す引数には

- symbol(任意) 対象とするトークンのシンボル 指定しない場合はSymbolを入力するためのフォームが現れ、ユーザーにシンボルを入力してもらう
- appName(任意) Scatterに表示されるアプリケーション名 指定しない場合はデフォルト値のPCS_APPとなります。
- theme(任意) コンポーネントのデザインテーマ THEMEをインポートしてDARK か WHITEのどちらかから選択してください。　指定しない場合はデフォルト値のDARKになります
- network(**必須**) 利用するEOSノードの情報をまとめたオブジェクトです。EOS_NETWORKをインポートして利用するネットワークを選択してください。

```
import { Setting, THEME, EOS_NETWORK } from "pcs-react"

<Setting symbol={"TST"} theme={THEME.DARK} appName={"PCS_SETTING"} network={EOS_NETWORK.kylin.laomao} />
```

