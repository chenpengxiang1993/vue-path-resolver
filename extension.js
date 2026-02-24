const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

// 与 webpack 常用 resolve.extensions 保持一致，优先 .vue
const TRY_EXTENSIONS = ['.vue', '.js', '.ts', '.jsx', '.tsx'];
const TRY_INDEX = ['index.vue', 'index.js', 'index.ts', 'index.jsx', 'index.tsx'];

// 与 vue.config.js 中的 alias 对应，用于无前缀相对路径时的解析
const ALIAS_TO_SRC = ['views', 'components', 'service', 'utils', 'assets', 'image'];

/** 向上查找包含 src 目录的根目录（兼容 fe 或 仓库根 打开），带按工作区缓存 */
const srcRootCache = new Map();
const SRC_ROOT_CACHE_MAX = 32;

function findSrcRoot(filePath) {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
  const cacheKey = workspaceFolder ? workspaceFolder.uri.fsPath : null;
  if (cacheKey !== null && srcRootCache.has(cacheKey)) return srcRootCache.get(cacheKey);

  let dir = path.dirname(filePath);
  const root = path.parse(filePath).root;
  while (dir !== root) {
    if (fs.existsSync(path.join(dir, 'src'))) {
      if (cacheKey !== null) {
        if (srcRootCache.size >= SRC_ROOT_CACHE_MAX) {
          const firstKey = srcRootCache.keys().next().value;
          srcRootCache.delete(firstKey);
        }
        srcRootCache.set(cacheKey, dir);
      }
      return dir;
    }
    dir = path.dirname(dir);
  }
  if (cacheKey !== null) {
    if (srcRootCache.size >= SRC_ROOT_CACHE_MAX) {
      const firstKey = srcRootCache.keys().next().value;
      srcRootCache.delete(firstKey);
    }
    srcRootCache.set(cacheKey, null);
  }
  return null;
}

/** 从路径字符串中去掉 query (?...) 和 hash (#...) */
function stripQueryAndHash(pathStr) {
  return pathStr.replace(/\?[^'"]*$|#[^'"]*$/g, '').trim();
}

/** 返回路径字符串内容及其在行内的起止偏移，用于 originSelectionRange */
function getPathStringAtPosition(document, position) {
  const line = document.lineAt(position.line).text;
  const offset = document.offsetAt(position) - document.offsetAt(new vscode.Position(position.line, 0));

  const checkMatch = (match, pathContent) => {
    const start = match.index + match[0].indexOf(pathContent);
    const end = start + pathContent.length;
    if (offset >= start && offset <= end) {
      return { path: stripQueryAndHash(pathContent), start, end };
    }
    return null;
  };

  // 1. 动态 import('...') 或 require('...')
  let re = /(?:import|require)\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    const out = checkMatch(m, m[1]);
    if (out) return out;
  }

  // 2. 静态 import ... from '...' 或 export ... from '...'
  re = /\b(?:from)\s+['"]([^'"]+)['"]/g;
  while ((m = re.exec(line)) !== null) {
    const out = checkMatch(m, m[1]);
    if (out) return out;
  }

  return null;
}

function resolvePathString(dirOfCurrentFile, pathStr, srcRoot) {
  const normalized = pathStr.replace(/\\/g, '/').trim();
  if (!normalized) return null;

  // 别名 @/xxx -> src/xxx（与 jsconfig paths 常见写法一致）
  if (normalized.startsWith('@/') && srcRoot) {
    const rest = normalized.slice(2);
    const full = path.join(srcRoot, 'src', rest);
    return { baseName: path.basename(rest), absoluteDir: path.dirname(full) };
  }

  // 别名：views/xxx、components/xxx 等（与 vue.config alias 一致）
  const aliasMatch = normalized.match(/^([a-zA-Z]+)\/(.*)$/);
  if (aliasMatch && ALIAS_TO_SRC.includes(aliasMatch[1]) && srcRoot) {
    const alias = aliasMatch[1];
    const rest = aliasMatch[2];
    const srcRel = alias === 'image' ? `assets/image/${rest}` : `${alias}/${rest}`;
    const dir = path.join(srcRoot, 'src', path.dirname(srcRel));
    return { baseName: path.basename(rest), absoluteDir: dir };
  }

  // 相对路径
  if (normalized.startsWith('.')) {
    const resolved = path.resolve(dirOfCurrentFile, normalized);
    return { baseName: path.basename(resolved), absoluteDir: path.dirname(resolved) };
  }

  return null;
}

function findExistingFile(basePathNoExt) {
  const dir = path.dirname(basePathNoExt);
  let base = path.basename(basePathNoExt);

  // 路径已带后缀时直接尝试
  const hasExt = TRY_EXTENSIONS.some((ext) => base.endsWith(ext));
  if (hasExt) {
    const full = path.join(dir, base);
    if (fs.existsSync(full)) return full;
    base = base.replace(/\.[^.]+$/, '');
  }

  for (const ext of TRY_EXTENSIONS) {
    const full = path.join(dir, base + ext);
    if (fs.existsSync(full)) return full;
  }
  const dirAsIndex = path.join(dir, base);
  if (fs.existsSync(dirAsIndex) && fs.statSync(dirAsIndex).isDirectory()) {
    for (const idx of TRY_INDEX) {
      const full = path.join(dirAsIndex, idx);
      if (fs.existsSync(full)) return full;
    }
  }
  return null;
}

function activate(context) {
  const provider = {
    provideDefinition(document, position) {
      try {
        const hit = getPathStringAtPosition(document, position);
        if (!hit) return null;

        const pathStr = hit.path;
        const dirOfCurrentFile = path.dirname(document.fileName);
        const srcRoot = findSrcRoot(document.fileName);

        const resolved = resolvePathString(dirOfCurrentFile, pathStr, srcRoot);
        if (!resolved) return null;

        const { baseName, absoluteDir } = resolved;
        const basePathNoExt = path.join(absoluteDir, baseName);
        const targetFile = findExistingFile(basePathNoExt);
        if (!targetFile) return null;

        const targetUri = vscode.Uri.file(path.normalize(targetFile));
        return new vscode.Location(targetUri, new vscode.Position(0, 0));
      } catch {
        return null;
      }
    }
  };

  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(
      [{ language: 'javascript' }, { language: 'javascriptreact' }, { language: 'typescript' }, { language: 'typescriptreact' }, { language: 'vue' }],
      provider
    )
  );

  // 工作区变更时清空 srcRoot 缓存，避免多仓库切换后解析到错误根目录
  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      srcRootCache.clear();
    })
  );
}

module.exports = { activate };
