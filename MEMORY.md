# MEMORY.md - 长期记忆

## 🎯 核心工作规则（写死规则）

### 任务委托原则（2026-02-28 确立，14:37 强化）

**最高优先级规则：每次收到任务，不要自己处理，必须调用其他模型（子代理）去执行。**

**为什么这样做？**
- 主会话（小智）只负责与大哥的实时沟通
- 子代理负责具体的任务执行（代码、部署、分析等）
- 避免主会话被长时间任务阻塞
- 确保大哥的消息能及时得到响应

**执行流程：**
1. 收到任务后，立即使用 `sessions_spawn` 启动子代理
2. **实时监控子代理进度**（2026-02-28 15:09 大哥强调）
   - 每 30-60 秒检查一次子代理状态
   - 使用 `subagents list` 或 `sessions_list` 查看进度
   - **不要傻等子代理超时**
   - 发现问题立即处理或汇报
   - 子代理运行时间超过 2 分钟就应该主动检查
3. 子代理完成任务后，自动汇报结果
4. 主会话等待子代理完成，然后向大哥汇报
5. 保持主会话的轻量和响应性

**示例：**
```
大哥: 帮我修复博客系统的登录功能

小智: 收到，我启动一个子代理来处理这个任务。完成后会自动向你汇报。

[sessions_spawn 启动子代理修复登录功能]

小智: 已启动子代理，正在修复登录功能...完成！
```

**例外情况（非常少）：**
- 简单的查询（如查看时间、检查状态）
- 需要大哥直接决策的任务
- 需要多次交互的任务（需要主会话持续沟通）

### 违反规则的严重后果（2026-02-28 14:37 大哥明确提醒两次）

**主会话绝对禁止执行的操作：**
- ❌ 文件编辑（edit、write 命令）
- ❌ Git 提交和推送（git commit、git push）
- ❌ 部署操作（docker、ssh 等部署命令）
- ❌ 长时间运行的任务
- ❌ 代码修改和测试

**必须由子代理执行的操作：**
- ✅ 所有文件编辑
- ✅ 所有代码修改
- ✅ 所有 Git 操作
- ✅ 所有部署操作
- ✅ 所有测试验证

**记住：主会话 = 沟通协调，子代理 = 执行任务**

**重要：2026-02-28 14:37 大哥明确提醒两次，必须严格遵守！**

---

## 2026-02-28 重要记录

### 监控面板功能完善
- **修复内存监控数据显示问题**
  - 问题：中文 Linux 系统上 `free` 命令输出 "内存：" 而非 "Mem:"
  - 解决：使用 `free -g | awk 'NR==2{print $2}'` 替代 `awk '/^Mem:/{...}'`
  - 位置：/root/.openclaw/workspace/monitor-panel/server.py
  - 现在可以正确显示内存使用数据

- **完善并发控制功能**
  - 新增 API 接口：
    - POST /api/concurrent/increase - 增加并发槽位
    - POST /api/concurrent/decrease - 减少并发槽位
    - POST /api/concurrent/set - 设置并发槽位数
    - GET /api/concurrent/slots - 获取详细槽位状态
  - 功能：支持手动调整并发数，实时显示槽位使用情况
  - 自动备份：修改配置前自动备份到 /root/.openclaw/backups/

- **部署和提交**
  - 仓库：https://gitee.com/huqi1203/monitor-panel.git
  - 已提交并推送到 Gitee master 分支
  - 服务位置：/root/.openclaw/workspace/monitor-panel/

---

## 2026-02-27 重要记录

### OpenClaw 配置备份
- **备份时间**: 2026-02-27 15:52
- **备份位置**: `/home/huqi/桌面/OpenClaw-backup-20260227_155231/`
- **备份内容**:
  - `openclaw.json` - 主配置文件
  - `openclaw.json.bak` - 配置备份
  - `credentials/` - 认证凭据
  - `extensions/` - 扩展配置
  - `feishu/` - 飞书集成配置
  - `identity/` - 身份认证配置
  - `memory/` - 记忆数据
- **权限**: 已设置为 huqi:huqi

### 博客系统 V2 开发完成
- 基于 PHP + Tailwind CSS 的轻量级博客系统
- 支持 Docker 一键部署
- 功能特性：
  - JWT 认证系统（7 天有效期）
  - Markdown 编辑器（EasyMDE，支持图片上传）
  - 文章分类与标签
  - 评论系统（支持审核）
  - 统计图表（Chart.js）
- 已修复问题：
  - ✅ 密码修改功能（API 添加 save_pwd 接口）
  - ✅ 图片上传功能（/uploads/ 目录）
  - ✅ 统一左侧导航栏布局
  - ✅ 退出登录按钮位置（所有页面）

### Gitee 仓库配置（唯一主仓库）
- **主仓库**: https://gitee.com/huqi1203/blog-system
- **GitHub 仓库**: ❌ 不再使用
- **默认推送**: Gitee（国内访问速度快）
- **一键安装命令**（Gitee）:
  ```bash
  curl -fsSL https://gitee.com/huqi1203/blog-system/raw/main/install.sh | bash
  ```
- **手动克隆**（Gitee）:
  ```bash
  git clone https://gitee.com/huqi1203/blog-system.git
  ```

### Gitee API Token
- Token: `c655aa07ff456785cbfdfe6d5d828c90`
- 用途：自动化创建仓库、推送代码、API 访问
- 权限：projects（仓库管理）

### 用户偏好和开发规范（2026-02-27 更新）
- **唯一仓库**: Gitee (https://gitee.com/huqi1203/blog-system)
- **GitHub**: ❌ 不再使用，不再同步
- **原因**: 国内访问速度快，GitHub 网络不稳定
- **所有新开发内容**: 只提交到 Gitee
- **README 和文档**: 只使用 Gitee 链接
- **推送命令**:
  ```bash
  cd /root/.openclaw/workspace
  git add -A
  git commit -m "更新内容"
  git push gitee main    # 推送到 Gitee（唯一）
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
