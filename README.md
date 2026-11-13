# 来，签合同

《来，签合同》（`contract-please`）是一款单机合同交涉游戏。当前可玩的剧本是 **泊石展务**。读合同，从想问的条款开口。碰到说不通的地方，用手里的原文回应对方，再决定是否接受改稿。

使用 Node.js 20 或更新版本。在项目根目录运行 `npm ci` 和 `npm start`，然后打开 [本地试玩](http://127.0.0.1:4173)。运行 `npm test` 检查类型、剧本引用和关卡规则。

交涉记录、提交过的原文和书面版本保存在当前浏览器。v0.4 首次进入时从新局开始。

- [玩法与泊石展务剧本规格](docs/来，签合同-玩法设计.md)
- [交涉框架与编剧指南](docs/交涉框架与编剧指南.md)
- [第二章剧本：与川数字（尚未实装）](docs/第二章/README.md)
- [开发与发布流程](docs/开发规格与交付流程.md)
- [劳动争议案例资料](docs/劳动争议案例资料.md)
- [旧版合同与陷阱归档](docs/archive/v0.2.2/README.md)。Git 标签 `v0.2.2` 保留初版，提交 `9fcf465` 保留迁移前的交涉版。

运行 `npm run build` 可生成用于托管的 `dist/`。本地试玩另有一个独立的 [户型图测试场景](http://127.0.0.1:4173/?chapter=window-demo)。

## GitHub Pages

在仓库的 **Settings → Pages → Build and deployment** 中将 **Source** 设为 **GitHub Actions**。推送到 `main` 后，工作流会按锁文件安装依赖、测试并构建，再发布 `dist/`。也可以在 **Actions → Deploy GitHub Pages** 手动运行。

## 授权

项目原创代码使用 MIT，包括 TypeScript、界面代码、构建工具和测试。原创剧本、虚构合同与材料文本、原创美术使用 CC BY 4.0，适用于构建产物和归档里对应的内容。第三方依赖和资料保留各自的许可和署名。 [MIT 正文](LICENSE) · [内容授权与署名](content/LICENSE.md)
