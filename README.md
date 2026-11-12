# 来，签合同

《来，签合同》（`contract-please`）是一款单机合同交涉游戏。当前可玩的剧本是 **泊石展务 · 八千怎么拆**。读合同，从想问的条款开口。碰到说不通的地方，用手里的原文回应对方，再决定是否接受改稿。

在项目根目录运行 `npm --prefix web start`，打开 [本地试玩](http://127.0.0.1:4173)。运行 `npm --prefix web test` 检查关卡规则和存档。需要 Node.js 18 或更新版本。

- [玩法与泊石展务剧本规格](docs/来，签合同-玩法设计.md)
- [交涉框架与编剧指南](docs/交涉框架与编剧指南.md)
- [开发与发布流程](docs/开发规格与交付流程.md)
- [劳动争议案例资料](docs/劳动争议案例资料.md)
- [旧版合同与陷阱归档](docs/archive/v0.2.2/README.md)

网页直接运行 `web/dist`，无需安装依赖或编译。

## GitHub Pages

在仓库的 **Settings → Pages → Build and deployment** 中将 **Source** 设为 **GitHub Actions**。推送到 `main` 后，工作流会发布 `web/dist`。也可以在 **Actions → Deploy GitHub Pages** 手动运行，部署地址会显示在该次运行中。
