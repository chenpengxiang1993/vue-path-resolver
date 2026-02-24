# Vue Path Resolver

让 **Cmd+点击**（或 Ctrl+点击）无后缀的 import/require 路径跳转到实际文件（`.vue`、`.js`、`index.vue` 等）。支持在 **多设备、多项目** 中通过扩展市场安装使用。

## 支持的写法

| 写法 | 示例 |
|------|------|
| 动态 import | `import('../../../views/Examination/BaseQuestionPage')` |
| require | `require('./utils/foo')` |
| 静态 import | `import QuestionPage from '../index'` |
| 再导出 | `export { x } from '../index'` |
| 路径带 query | `import('./foo?v=1')` → 解析为 `foo` |

- **相对路径**：`./`、`../`、`../../../views/...`
- **别名**：`views/...`、`components/...`（与 vue.config.js alias 一致）、`@/...`（与 jsconfig paths 一致）
- **自动尝试后缀**：`.vue`、`.js`、`.ts`、`.jsx`、`.tsx` 及目录下的 `index.*`

---

## 安装方式

### 方式一：从扩展市场安装（推荐，多设备、多项目）

若已发布到 **Open VSX**（Cursor）或 **VS Code Marketplace**：

1. 打开 Cursor 或 VS Code，`Cmd+Shift+X`（Mac）或 `Ctrl+Shift+X`（Windows）打开扩展面板
2. 搜索 **Vue Path Resolver**
3. 点击安装

之后在任意设备、任意项目中都可直接搜索安装，无需再拷代码或 `.vsix`。

**如何发布到扩展市场？** 见 [PUBLISH.md](./PUBLISH.md)，按步骤发布到 Open VSX（供 Cursor 使用）或 VS Code Marketplace。

---

### 方式二：从本机路径安装（开发/未发布时）

1. 按 **Cmd+Shift+P** / **Ctrl+Shift+P**，选择 **Developer: Install Extension from Location...**
2. 选择本仓库下的 **`vue-path-resolver`** 文件夹
3. 安装后执行 **Developer: Reload Window**

---

### 方式三：从 .vsix 安装

若你有打包好的 `.vsix` 文件（例如从 GitHub Release 下载）：

- 扩展面板 → 右上角 **...** → **从 VSIX 安装...** → 选择该文件

---

## 说明

- 仅在前端项目（存在 `src` 目录）中生效；若工作区为仓库根目录，会向上查找包含 `src` 的目录作为解析根目录。
- 不修改任何业务代码，与现有无后缀引入方式完全兼容。
- **若「转到定义」出现两个结果**：编辑器内置的 JS/TS 解析有时会对无后缀路径再给出一条（如 `index`），该条可能无法打开。请选择**带真实后缀的那一条**（如 `index.vue`），即可正确打开文件。

## License

MIT
