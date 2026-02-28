# Blog System v2 - 功能增强版

## 🚀 主要增强功能

### 1. JWT 认证系统
- 安全的 JWT Token 认证
- 支持登录/注册
- Token 自动过期（7天）
- 管理员权限控制

### 2. 文章分类与标签
- 可自定义文章分类（带图标）
- 文章标签系统
- 按分类/标签筛选文章
- 热门标签云展示

### 3. 评论系统
- 访客评论功能
- 评论审核机制
- 邮件通知（预留接口）
- 评论管理后台

### 4. 现代化 UI
- Tailwind CSS 框架
- 响应式设计（移动端适配）
- 渐变色彩主题
- 卡片式布局

### 5. 后台管理图表
- Chart.js 统计图表
- 日访问量趋势图
- 热门文章 TOP5
- 实时数据统计

### 6. 其他功能
- Markdown 编辑器（实时预览）
- 文章搜索功能
- 分页显示
- 社交分享按钮

## 📁 文件结构

```
blog-system/
├── api.php                 # 增强版 API（JWT + 全功能）
├── index.html              # 新版首页（Tailwind CSS）
├── article.html            # 文章详情页（含评论）
├── Dockerfile              # Docker 配置
├── docker-compose.yml      # Docker Compose 配置
└── admin/                  # 后台管理
    ├── index.html          # 仪表盘（含图表）
    ├── login.html          # JWT 登录页
    ├── articles.html       # 文章管理
    ├── edit.html           # 文章编辑（Markdown）
    ├── comments.html       # 评论管理
    ├── categories.html     # 分类管理
    └── settings.html       # 系统设置
```

## 🔧 安装方式

### Docker 方式（推荐）

```bash
# 克隆仓库
git clone https://github.com/huqi1203/blog-system.git
cd blog-system

# 启动服务
docker-compose up -d

# 访问地址
# 博客首页：http://localhost:8686
# 管理后台：http://localhost:8686/admin
# 默认账号：admin / admin123
```

### 传统方式

```bash
# 需要 PHP 8.1+ 和 Apache/Nginx
# 将代码放到 web 目录
# 确保 data/ 目录可写
```

## 📊 API 接口

### 认证相关
- `POST ?action=login` - 登录
- `POST ?action=register` - 注册
- `GET ?action=me` - 获取当前用户

### 文章相关
- `GET ?action=get_articles` - 获取文章列表（支持分页、搜索、筛选）
- `GET ?action=get_article&id=xxx` - 获取文章详情
- `POST ?action=save_article` - 保存文章（需认证）
- `POST ?action=del_article` - 删除文章（需管理员）

### 分类相关
- `GET ?action=get_categories` - 获取分类列表
- `POST ?action=save_category` - 保存分类（需管理员）
- `POST ?action=del_category` - 删除分类（需管理员）

### 评论相关
- `GET ?action=get_comments` - 获取评论列表
- `POST ?action=add_comment` - 添加评论
- `POST ?action=approve_comment` - 审核评论（需管理员）
- `POST ?action=del_comment` - 删除评论（需管理员）

### 统计相关
- `GET ?action=get_stats` - 获取统计数据（需管理员）

### 设置相关
- `GET ?action=get_config` - 获取配置
- `POST ?action=save_config` - 保存配置（需管理员）

## 🛠️ 技术栈

- **后端**: PHP 8.1 + JSON 文件存储
- **前端**: Tailwind CSS + Font Awesome
- **图表**: Chart.js
- **编辑器**: Marked.js (Markdown)
- **认证**: JWT

## 🔐 默认账号

- 用户名: `admin`
- 密码: `admin123`

**注意**: 部署后请立即修改默认密码！

## 📱 访问地址

部署后访问：
- 博客首页：`http://你的IP:8686`
- 管理后台：`http://你的IP:8686/admin`

## 📝 待完善功能

- [ ] 数据库支持（MySQL/MongoDB）
- [ ] 图片上传功能
- [ ] 邮件通知
- [ ] 多用户角色
- [ ] 主题切换
- [ ] SEO 优化

---

**版本**: v2.0  
**更新日期**: 2026-02-25  
**作者**: OpenClaw
