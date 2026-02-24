# 发布为个人插件（多设备、多项目使用）

按以下步骤可将本扩展发布到扩展市场，之后在任意设备、任意项目中直接搜索安装即可。

---

## 一、发布前准备

### 1. 替换为你的 GitHub 信息

编辑 `package.json`，将下面三处的 **`your-github-username`** 改为你的 **GitHub 用户名**：

- `publisher`: 建议与 GitHub 用户名一致（发布到 Open VSX 时会用作 namespace）
- `repository.url`
- `bugs.url`、`homepage`

### 2. 推送到个人 GitHub 仓库

**方式 A：独立仓库（推荐，便于发布与分享）**

```bash
cd vue-path-resolver
git init
git add .
git commit -m "feat: Vue Path Resolver extension"
git branch -M main
git remote add origin https://github.com/你的用户名/vue-path-resolver.git
git push -u origin main
```

**方式 B：保留在当前项目内**

保持扩展在 `dlscms-v2/vue-path-resolver`，只在本仓库内维护；发布时在 `vue-path-resolver` 目录下执行下面的打包/发布命令即可。

---

## 二、发布到 Open VSX（Cursor 推荐）

Cursor 使用 Open VSX 扩展市场，发布到这里后可在 Cursor 里直接搜索安装。

### 1. 注册并登录 Open VSX

1. 打开 [open-vsx.org](https://open-vsx.org/)
2. 用 **GitHub** 登录
3. 若需签署协议：进入个人设置，用 **Eclipse 账号** 登录并同意 Publisher Agreement（[Eclipse 注册](https://accounts.eclipse.org/user/register)）

### 2. 创建 Namespace（发布者命名空间）

1. 在 Open VSX 个人页进入 **Publisher** / Namespace 相关设置
2. 创建 namespace，名称填 **与 `package.json` 中 `publisher` 一致**（如你的 GitHub 用户名）

### 3. 获取发布用 Token

1. Open VSX 个人设置 → **Access Tokens**
2. 生成新 Token，复制保存（只显示一次）

### 4. 安装 ovsx 并发布

在 **扩展目录** `vue-path-resolver` 下执行：

```bash
# 安装 Open VSX 命令行工具（可选，也可用 npx）
npm i -g ovsx

# 打包（会生成 .vsix）
npx @vscode/vsce package

# 发布到 Open VSX（会提示输入 token，或使用环境变量）
npx ovsx publish vue-path-resolver-0.1.0.vsix -p <你的OpenVSX_TOKEN>
```

或使用环境变量避免明文 token：

```bash
export OVSX_PAT=你的Token
npx ovsx publish vue-path-resolver-0.1.0.vsix
```

发布成功后，在 [open-vsx.org](https://open-vsx.org/) 可搜到你的扩展。

### 5. 在 Cursor 中安装

1. 打开 Cursor，`Cmd+Shift+X` 打开扩展
2. 搜索 **Vue Path Resolver**（或你的 displayName）
3. 点击安装

之后在任意设备、任意项目里都可以这样安装使用。

---

## 三、可选：发布到 VS Code Marketplace

若希望在使用 VS Code 的设备上也能直接搜索安装，可再发布到微软市场。

### 1. 创建 Publisher

1. 打开 [Visual Studio Marketplace 发布管理](https://marketplace.visualstudio.com/manage)
2. 用微软账号登录，创建 **Publisher**，名称建议与 `package.json` 的 `publisher` 一致

### 2. 获取 Azure DevOps PAT

1. 登录 [Azure DevOps](https://dev.azure.com/)
2. 用户设置 → Personal Access Tokens → 新建
3. 权限勾选 **Marketplace (Manage)**，生成并复制 Token

### 3. 发布

在 `vue-path-resolver` 目录下：

```bash
npx @vscode/vsce package
npx @vscode/vsce publish
# 按提示输入 PAT，或使用 --pat <token>
```

---

## 四、后续更新

1. 在 `package.json` 中把 `version` 改为新版本（如 `0.1.1`）
2. 重新打包并发布：
   - Open VSX：`npx @vscode/vsce package` 后 `npx ovsx publish xxx.vsix -p <token>`
   - VS Code Marketplace：`npx @vscode/vsce publish`
3. 各设备上在扩展里点「更新」即可

---

## 五、多设备使用方式小结

| 方式 | 适用场景 |
|------|----------|
| **从 Open VSX / Marketplace 安装** | 已发布；任意设备、任意项目，搜索「Vue Path Resolver」安装 |
| **从 GitHub Release 的 .vsix 安装** | 未发布或只想内部分发：在 Release 上传 .vsix，设备上「从 VSIX 安装」 |
| **从本机路径安装** | 开发调试：用「Install Extension from Location」选择本仓库中的 `vue-path-resolver` 目录 |

发布到 Open VSX 后，在 Cursor 中即可像使用其他扩展一样，在多设备、多项目中安装和更新。
