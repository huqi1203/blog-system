# Blog System v2 - PHP 博客系统

基于 PHP + Tailwind CSS 的轻量级博客系统，支持 Docker 一键部署。

## ✨ 功能特性

- ✅ **JWT 认证系统** - 安全的 Token 认证，7 天有效期
- ✅ **Markdown 编辑器** - EasyMDE 实时预览，支持图片上传
- ✅ **文章分类与标签** - 自定义分类图标，标签筛选
- ✅ **评论系统** - 访客评论，审核机制
- ✅ **响应式设计** - Tailwind CSS，移动端适配
- ✅ **统计图表** - Chart.js 访问统计，热门文章
- ✅ **Docker 部署** - 一键启动，开箱即用

## 🚀 快速开始

### 方式 1: 一键安装（推荐 ⭐）

**在任何有 Docker 的设备上执行：**

```bash
curl -fsSL https://gitee.com/huqi1203/blog-system/raw/main/install.sh | bash
```

### 方式 2: 手动安装

```bash
# 1. 克隆项目
git clone https://gitee.com/huqi1203/blog-system.git
cd blog-system

# 2. 启动服务
docker-compose up -d

# 3. 访问博客
# 博客首页：http://localhost:8686
# 管理后台：http://localhost:8686/admin
# 默认账号：admin / admin123
```

### 方式 2: 本地 PHP 环境

```bash
# 1. 克隆项目
git clone https://gitee.com/huqi1203/blog-system.git
cd blog-system

# 2. 启动 PHP 内置服务器
php -S localhost:8686

# 3. 访问博客
# http://localhost:8686
```

## 📁 项目结构

```
blog-system/
├── api.php                 # API 接口（JWT + 全功能）
├── index.html              # 博客首页（Tailwind CSS）
├── article.html            # 文章详情页（含评论）
├── articles.html           # 文章列表页
├── Dockerfile              # Docker 配置
├── docker-compose.yml      # Docker Compose 配置
├── data/                   # 数据存储目录
│   ├── articles.json       # 文章数据
│   ├── categories.json     # 分类数据
│   ├── comments.json       # 评论数据
│   ├── config.json         # 系统配置
│   ├── users.json          # 用户数据
│   └── uploads/            # 上传的图片
└── admin/                  # 后台管理
    ├── index.html          # 仪表盘（含图表）
    ├── login.html          # JWT 登录页
    ├── articles.html       # 文章管理
    ├── edit.html           # 文章编辑（Markdown）
    ├── comments.html       # 评论管理
    ├── categories.html     # 分类管理
    └── settings.html       # 系统设置
```

## 📊 API 接口

### 认证相关
| 方法 | 接口 | 说明 |
|------|------|------|
| POST | `?action=login` | 登录 |
| POST | `?action=register` | 注册 |
| GET | `?action=me` | 获取当前用户 |

### 文章相关
| 方法 | 接口 | 说明 |
|------|------|------|
| GET | `?action=get_articles` | 获取文章列表（分页/搜索/筛选） |
| GET | `?action=get_article&id=xxx` | 获取文章详情 |
| POST | `?action=save_article` | 保存文章（需认证） |
| POST | `?action=del_article` | 删除文章（需管理员） |

### 分类相关
| 方法 | 接口 | 说明 |
|------|------|------|
| GET | `?action=get_categories` | 获取分类列表 |
| POST | `?action=save_category` | 保存分类（需管理员） |
| POST | `?action=del_category` | 删除分类（需管理员） |

### 评论相关
| 方法 | 接口 | 说明 |
|------|------|------|
| GET | `?action=get_comments` | 获取评论列表 |
| POST | `?action=add_comment` | 添加评论 |
| POST | `?action=approve_comment` | 审核评论（需管理员） |
| POST | `?action=del_comment` | 删除评论（需管理员） |

### 图片上传
| 方法 | 接口 | 说明 |
|------|------|------|
| POST | `?action=upload_image` | 上传图片（需认证） |

### 统计与配置
| 方法 | 接口 | 说明 |
|------|------|------|
| GET | `?action=get_stats` | 获取统计数据（需管理员） |
| GET | `?action=get_config` | 获取配置 |
| POST | `?action=save_config` | 保存配置（需管理员） |

## 🛠️ 技术栈

- **后端**: PHP 8.1 + JSON 文件存储
- **前端**: Tailwind CSS + Font Awesome
- **图表**: Chart.js
- **编辑器**: EasyMDE (Markdown)
- **认证**: JWT

## 🔐 默认账号

- 用户名：`admin`
- 密码：`admin123`

**⚠️ 注意**: 部署后请立即修改默认密码！

## 📱 访问地址

部署后访问：
- 博客首页：`http://你的 IP:8686`
- 管理后台：`http://你的 IP:8686/admin`

## 🌍 在其他设备使用

### 局域网访问

1. 确保设备在同一局域网
2. 查看本机 IP 地址：
   ```bash
   # Linux/Mac
   ip addr show | grep "inet "
   
   # Windows
   ipconfig
   ```

3. 在其他设备浏览器访问：
   ```
   http://你的IP:8686
   ```

### 云服务器部署

```bash
# 1. 确保服务器防火墙开放 8686 端口
sudo ufw allow 8686

# 2. 启动 Docker
docker-compose up -d

# 3. 访问
http://服务器公网 IP:8686
```

## 📝 更新日志

### v2.1 (2026-02-27)
- ✅ 新增图片上传功能
- ✅ EasyMDE 编辑器集成
- ✅ Docker volume 持久化
- ✅ 文件类型验证（JPG/PNG/GIF/WebP）

### v2.0 (2026-02-25)
- ✅ JWT 认证系统
- ✅ 文章分类与标签
- ✅ 评论系统
- ✅ 统计图表

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**版本**: v2.1  
**更新日期**: 2026-02-27  
**作者**: huqi1203
