#!/bin/bash
# Blog System V2 - 一键安装脚本
# 用法：
#   GitHub: curl -fsSL https://raw.githubusercontent.com/huqi1203/blog-system/main/install.sh | bash
#   Gitee:  curl -fsSL https://gitee.com/huqi1203/blog-system/raw/main/install.sh | bash

set -e

echo "🚀 开始安装博客系统 V2..."

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ 未检测到 Docker，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ 未检测到 Docker Compose，请先安装"
    exit 1
fi

# 选择镜像源
echo ""
echo "📦 选择代码源:"
echo "  1) GitHub (https://github.com)"
echo "  2) Gitee (https://gitee.com) - 国内推荐"
read -p "请选择 (默认 2): " source_choice
source_choice=${source_choice:-2}

if [ "$source_choice" = "1" ]; then
    REPO_URL="https://github.com/huqi1203/blog-system.git"
    echo "✅ 使用 GitHub 作为代码源"
else
    REPO_URL="https://gitee.com/huqi1203/blog-system.git"
    echo "✅ 使用 Gitee 作为代码源"
fi

# 创建项目目录
PROJECT_DIR="${BLOG_DIR:-blog-system}"
if [ -d "$PROJECT_DIR" ]; then
    echo "⚠️  目录 $PROJECT_DIR 已存在"
    read -p "是否删除并重新安装？(y/N): " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        rm -rf "$PROJECT_DIR"
        echo "🗑️  已删除旧目录"
    else
        echo "❌ 安装取消"
        exit 1
    fi
fi

# 克隆项目
echo "📦 克隆项目..."
git clone "$REPO_URL" "$PROJECT_DIR"
cd "$PROJECT_DIR"

# 创建数据目录
echo "📁 创建数据目录..."
mkdir -p data uploads
chmod 777 data uploads

# 启动服务
echo "🔧 启动服务..."
if docker compose version &> /dev/null; then
    docker compose up -d
else
    docker-compose up -d
fi

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务状态
if docker ps | grep -q blog-system; then
    echo ""
    echo "✅ 安装完成！"
    echo ""
    echo "📍 访问地址:"
    echo "   博客首页：http://localhost:8080"
    echo "   管理后台：http://localhost:8080/admin"
    echo ""
    echo "🔐 默认账号:"
    echo "   用户名：admin"
    echo "   密码：admin123"
    echo ""
    echo "⚠️  请及时修改默认密码！"
    echo ""
    echo "📚 常用命令:"
    echo "   查看日志：cd $PROJECT_DIR && docker compose logs -f"
    echo "   停止服务：cd $PROJECT_DIR && docker compose down"
    echo "   重启服务：cd $PROJECT_DIR && docker compose restart"
else
    echo "❌ 服务启动失败，请检查日志："
    echo "   cd $PROJECT_DIR && docker compose logs"
    exit 1
fi
