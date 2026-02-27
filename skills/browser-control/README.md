# 🌐 Browser Control Skill

浏览器控制技能 - 让 OpenClaw 帮你自动化操作网页

## 🚀 快速开始

### 1. 启动 Chrome Debug
在终端运行：
```bash
/home/huqi/桌面/chrome-debug.sh
```

### 2. 使用浏览器控制
现在可以直接对我说：
- "打开 https://github.com"
- "截图看看"
- "搜索 OpenClaw 教程"
- "点击登录按钮"

## 📋 支持的操作

| 操作 | 示例 |
|------|------|
| 打开网页 | `打开 https://example.com` |
| 截图 | `截图` / `截个图看看` |
| 点击元素 | `点击 "提交按钮"` |
| 输入文字 | `输入 "hello" 到搜索框` |
| 滚动页面 | `滚动到底部` |
| 刷新页面 | `刷新` |

## 🔧 技术原理

- 使用 Chrome DevTools Protocol (CDP)
- 通过端口 9222 连接浏览器
- 配置文件：`~/.openclaw/openclaw.json`

## ⚠️ 注意事项

1. **必须先启动 Chrome Debug** 才能使用
2. 需要图形界面（不能在纯 SSH 环境使用）
3. 部分网站可能有反爬虫机制

## 📝 配置文件

OpenClaw 配置中已添加：
```json
"browser": {
  "enabled": true,
  "defaultProfile": "mydebug",
  "profiles": {
    "mydebug": {
      "cdpUrl": "http://127.0.0.1:9222"
    }
  }
}
```
