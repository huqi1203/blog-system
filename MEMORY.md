# MEMORY.md - 长期记忆

## 2026-02-27 重要记录

### 博客系统 V2 开发完成
- 基于 PHP + Tailwind CSS 的轻量级博客系统
- 支持 Docker 一键部署
- 功能特性：
  - JWT 认证系统（7 天有效期）
  - Markdown 编辑器（EasyMDE，支持图片上传）
  - 文章分类与标签
  - 评论系统（支持审核）
  - 统计图表（Chart.js）
- 修复问题：
  - 密码修改功能（API 添加 save_pwd 接口）
  - 图片上传功能（/uploads/ 目录）
  - 统一左侧导航栏布局

### Gitee 仓库配置
- **主仓库**: https://gitee.com/huqi1203/blog-system
- **备份仓库**: https://github.com/huqi1203/blog-system
- **默认推送**: Gitee（国内访问速度快）
- **双平台同步**: 代码同时推送到 GitHub 和 Gitee
- **一键安装**:
  - Gitee: `curl -fsSL https://gitee.com/huqi1203/blog-system/raw/main/install.sh | bash`
  - GitHub: `curl -fsSL https://raw.githubusercontent.com/huqi1203/blog-system/main/install.sh | bash`

### Gitee API Token
- Token: `c655aa07ff456785cbfdfe6d5d828c90`
- 用途：自动化创建仓库、推送代码
- 权限：projects（仓库管理）

### 用户偏好（2026-02-27 更新）
- **默认仓库**: Gitee (https://gitee.com/huqi1203/blog-system)
- **原因**: 国内访问速度快，GitHub 网络不稳定
- **策略**: 双平台备份（Gitee 为主，GitHub 为辅）
- **推送命令**:
  ```bash
  cd /root/.openclaw/workspace
  git add -A
  git commit -m "更新内容"
  git push gitee main    # 推送到 Gitee（默认）
  git push origin main   # 推送到 GitHub（备份）
  ```

---

## 2026-02-05 重要记录

### 汽水音乐抓包版 APK 构建完成
- 成功创建了具备抓包功能的修改版 APK
- 文件位置：/home/huqi/桌面/sodamusic_minimal_modified_20260205_085637.apk
- 包含网络安全配置，允许流量拦截和分析

### 汽水音乐抓包工具链开发完成
- 采用 Frida 作为网络请求劫持工具（因直接修改 APK 技术限制）
- 开发了完整的工具链：
  - frida_sodamusic_hook.js - 网络请求劫持脚本
  - frida_sodamusic_capture.py - 实时监控工具
  - sodamusic_param_extractor.py - 参数提取工具
  - run_capture.sh - 一键启动脚本

### 功能实现
- 实现了类似快手极速版免 root 一键版本.apk 的实时显示和一键复制功能
- 通过工具组合实现与内置功能相同的效果
- 支持青龙面板环境变量格式输出

### 用户偏好
- 所有制作的文件需放在桌面上
- 需要抓包功能用于分析网络流量
