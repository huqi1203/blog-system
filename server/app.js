const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ===== 核心配置 =====
const ARTICLE_DIR = path.join(__dirname, '../articles');
const CONFIG_FILE = path.join(__dirname, '../config.json');
const PORT = 3001;

// 过滤标题非法字符
function filterTitle(title) {
    const illegalChars = /[\\/:*?"<>|]/g;
    return title.replace(illegalChars, '_').trim() || '未命名文章';
}

// 初始化目录和配置
async function initFiles() {
    await fs.mkdir(ARTICLE_DIR, { recursive: true });
    try { await fs.access(CONFIG_FILE); }
    catch (err) {
        const initConfig = { bg: "b1", about: "你好，欢迎来到我的个人博客！", pwd: "abc789.." };
        await fs.writeFile(CONFIG_FILE, JSON.stringify(initConfig, null, 2), 'utf8');
    }
}

// ===== 接口1：获取所有文章 (兼容like/comments字段) =====
app.get('/api/getAllArticles', async (req, res) => {
    try {
        const files = await fs.readdir(ARTICLE_DIR);
        const articles = [];
        for (const file of files) {
            if (file.endsWith('.json')) {
                const content = await fs.readFile(path.join(ARTICLE_DIR, file), 'utf8');
                const art = JSON.parse(content);
                // 兼容旧文章：自动补全like和comments字段
                art.like = art.like || 0;
                art.comments = art.comments || [];
                art.read = art.read || 0;
                articles.push(art);
            }
        }
        articles.sort((a, b) => new Date(b.time) - new Date(a.time));
        res.json({ success: true, articles });
    } catch (err) { res.status(500).json({ success: false, error: '读取文章失败' }); }
});

// ===== 接口2：获取系统配置 =====
app.get('/api/getConfig', async (req, res) => {
    try {
        const config = JSON.parse(await fs.readFile(CONFIG_FILE, 'utf8'));
        res.json({ success: true, config });
    } catch (err) { res.status(500).json({ success: false, error: '读取配置失败' }); }
});

// ===== 接口3：发布/编辑文章 (初始化like/comments) =====
app.post('/api/saveArticle', async (req, res) => {
    try {
        const { article, isEdit } = req.body;
        const fileName = `${filterTitle(article.title)}.json`;
        const filePath = path.join(ARTICLE_DIR, fileName);

        // 初始化点赞数和评论列表
        article.like = article.like || 0;
        article.comments = article.comments || [];
        article.read = article.read || 0;

        if (isEdit) {
            const files = await fs.readdir(ARTICLE_DIR);
            for (const f of files) {
                if (f.endsWith('.json')) {
                    const content = await fs.readFile(path.join(ARTICLE_DIR, f), 'utf8');
                    const art = JSON.parse(content);
                    if (art.id === article.id) { await fs.unlink(path.join(ARTICLE_DIR, f)); break; }
                }
            }
        }
        await fs.writeFile(filePath, JSON.stringify(article, null, 2), 'utf8');
        res.json({ success: true, msg: isEdit ? '编辑成功' : '发布成功' });
    } catch (err) { res.status(500).json({ success: false, error: '保存文章失败' }); }
});

// ===== 接口4：删除文章 =====
app.post('/api/deleteArticle', async (req, res) => {
    try {
        const { id } = req.body;
        const files = await fs.readdir(ARTICLE_DIR);
        for (const f of files) {
            if (f.endsWith('.json')) {
                const content = await fs.readFile(path.join(ARTICLE_DIR, f), 'utf8');
                const art = JSON.parse(content);
                if (art.id === id) { await fs.unlink(path.join(ARTICLE_DIR, f)); break; }
            }
        }
        res.json({ success: true, msg: '删除成功' });
    } catch (err) { res.status(500).json({ success: false, error: '删除文章失败' }); }
});

// ===== 接口5：保存配置 =====
app.post('/api/saveConfig', async (req, res) => {
    try {
        const { type, value } = req.body;
        const config = JSON.parse(await fs.readFile(CONFIG_FILE, 'utf8'));
        if (type === 'bg') config.bg = value;
        if (type === 'about') config.about = value;
        if (type === 'pwd') config.pwd = value;
        await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
        res.json({ success: true, msg: '配置保存成功' });
    } catch (err) { res.status(500).json({ success: false, error: '保存配置失败' }); }
});

// ===== 接口6：新增！更新文章点赞数（持久化） =====
app.post('/api/updateLike', async (req, res) => {
    try {
        const { id } = req.body;
        const files = await fs.readdir(ARTICLE_DIR);
        for (const f of files) {
            if (f.endsWith('.json')) {
                const filePath = path.join(ARTICLE_DIR, f);
                const content = await fs.readFile(filePath, 'utf8');
                const art = JSON.parse(content);
                if (art.id === id) {
                    art.like = (art.like || 0) + 1; // 点赞数+1
                    await fs.writeFile(filePath, JSON.stringify(art, null, 2), 'utf8');
                    res.json({ success: true, like: art.like, msg: '点赞成功' });
                    return;
                }
            }
        }
        res.json({ success: false, msg: '文章不存在' });
    } catch (err) { res.status(500).json({ success: false, error: '点赞失败' }); }
});

// ===== 接口7：新增！提交评论（持久化到对应文章） =====
app.post('/api/addComment', async (req, res) => {
    try {
        const { id, name, content } = req.body;
        const files = await fs.readdir(ARTICLE_DIR);
        for (const f of files) {
            if (f.endsWith('.json')) {
                const filePath = path.join(ARTICLE_DIR, f);
                const artContent = await fs.readFile(filePath, 'utf8');
                const art = JSON.parse(artContent);
                if (art.id === id) {
                    // 构造评论数据
                    const comment = {
                        name: name,
                        content: content,
                        time: new Date().toLocaleString() // 评论时间
                    };
                    art.comments = art.comments || [];
                    art.comments.push(comment); // 新增评论到列表
                    await fs.writeFile(filePath, JSON.stringify(art, null, 2), 'utf8');
                    res.json({ success: true, comments: art.comments, msg: '评论成功' });
                    return;
                }
            }
        }
        res.json({ success: false, msg: '文章不存在' });
    } catch (err) { res.status(500).json({ success: false, error: '评论失败' }); }
});

// ===== 接口8：数据备份（包含点赞+评论） =====
app.get('/api/backupData', async (req, res) => {
    try {
        const files = await fs.readdir(ARTICLE_DIR);
        const articles = [];
        for (const file of files) {
            if (file.endsWith('.json')) {
                const content = await fs.readFile(path.join(ARTICLE_DIR, file), 'utf8');
                const art = JSON.parse(content);
                art.like = art.like || 0;
                art.comments = art.comments || [];
                articles.push(art);
            }
        }
        const config = JSON.parse(await fs.readFile(CONFIG_FILE, 'utf8'));
        const backup = { articles, ...config };
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=blog_backup_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`);
        res.send(JSON.stringify(backup, null, 2));
    } catch (err) { res.status(500).json({ error: '备份失败' }); }
});

// 启动服务
initFiles().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ 后端服务稳定运行：http://192.168.1.222:${PORT}`);
        console.log(`✅ 文章目录：${ARTICLE_DIR} (含点赞+评论持久化)`);
    });
});
