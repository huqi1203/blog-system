// ===================== 前端核心配置：已配置你的NAS真实IP =====================
const API_BASE_URL = "http://192.168.1.222:3001/api";

// ===================== 全局变量 =====================
let globalData = { articles: [], bg: "b1", about: "", pwd: "abc789.." };

const blog = {
    editId: "",
    // 初始化：先读配置，再读文章（适配新后端接口）
    async initGlobalData() {
        try {
            const resConfig = await fetch(`${API_BASE_URL}/getConfig`);
            const configData = await resConfig.json();
            const resArticle = await fetch(`${API_BASE_URL}/getAllArticles`);
            const articleData = await resArticle.json();
            
            if(configData.success && articleData.success){
                globalData.bg = configData.config.bg;
                globalData.about = configData.config.about;
                globalData.pwd = configData.config.pwd;
                globalData.articles = articleData.articles;
                console.log("✅ 数据加载成功：配置+文章+点赞+评论同步完成");
            }
        } catch (err) {
            console.error("加载数据失败：", err);
            alert("✅ 后端服务已启动！请刷新页面重试");
        }
    },
    // 时间显示
    initTime: function(){
        const t = new Date();
        const fmt = n => n.toString().padStart(2, "0");
        const week = ["日","一","二","三","四","五","六"][t.getDay()];
        const timeStr = `${t.getFullYear()}年${fmt(t.getMonth()+1)}月${fmt(t.getDate())}日 星期${week} ${fmt(t.getHours())}:${fmt(t.getMinutes())}:${fmt(t.getSeconds())}`;
        if(document.getElementById("current-time")) document.getElementById("current-time").innerText = timeStr;
        if(document.getElementById("time")) document.getElementById("time").innerText = timeStr;
    },
    // 背景初始化
    initBg: function(){
        if(!globalData.bg) globalData.bg = "b1";
        const bgVal = this.bgList.find(item => item.k === globalData.bg).v;
        document.body.style.background = bgVal;
        if(document.querySelectorAll(".color-item").length > 0){
            document.querySelectorAll(".color-item").forEach(item => {
                item.classList.remove("active");
                if(item.dataset.k === globalData.bg) item.classList.add("active");
            });
        }
    },
    bgList: [
        {k:"b1",v:"linear-gradient(145deg, #141E30, #243B55)"},
        {k:"b2",v:"linear-gradient(145deg, #0F2027, #2C5364)"},
        {k:"b3",v:"linear-gradient(145deg, #2C3E50, #4CA1AF)"},
        {k:"b4",v:"linear-gradient(145deg, #140F29, #3A2668)"},
        {k:"b5",v:"linear-gradient(145deg, #000000, #434343)"},
        {k:"b6",v:"linear-gradient(145deg, #606c88, #3f4c6b)"},
        {k:"b7",v:"linear-gradient(145deg, #2980b9, #6dd5fa)"},
        {k:"b8",v:"linear-gradient(145deg, #8e44ad, #9b59b6)"},
        {k:"b9",v:"linear-gradient(145deg, #c0392b, #e74c3c)"},
        {k:"b10",v:"linear-gradient(145deg, #16a085, #2ecc71)"}
    ],
    initColorList: function(){
        const list = document.getElementById("color-list");
        if(!list) return;
        this.bgList.forEach(item => {
            const div = document.createElement("div");
            div.className = "color-item";
            div.dataset.k = item.k;
            div.style.background = item.v;
            div.onclick = async () => {
                globalData.bg = item.k;
                this.initBg();
                await fetch(`${API_BASE_URL}/saveConfig`, {
                    method: 'POST',headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'bg', value: item.k })
                });
            };
            list.appendChild(div);
        });
    },
    initAbout: function(){
        if(!globalData.about) globalData.about = "你好，欢迎来到我的个人博客！";
        const aboutText = globalData.about;
        if(document.getElementById("about-text")){
            if(document.getElementById("about-text").tagName === "TEXTAREA"){
                document.getElementById("about-text").value = aboutText;
            }else{
                document.getElementById("about-text").innerText = aboutText;
            }
        }
    },
    async saveAbout(){
        const content = document.getElementById("about-text").value.trim();
        globalData.about = content;
        const res = await fetch(`${API_BASE_URL}/saveConfig`, {
            method: 'POST',headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'about', value: content })
        });
        const data = await res.json();
        if(data.success) document.getElementById("about-tips").innerText = "保存成功！";
        this.initAbout();
    },
    async savePwd(){
        const oldPwd = document.getElementById("old-pwd").value.trim();
        const newPwd = document.getElementById("new-pwd").value.trim();
        const newPwd2 = document.getElementById("new-pwd2").value.trim();
        const tips = document.getElementById("pwd-tips");
        const currPwd = globalData.pwd || "abc789..";
        if(oldPwd !== currPwd){ tips.className = "tips error"; tips.innerText = "原密码错误！"; return; }
        if(newPwd.length < 6){ tips.className = "tips error"; tips.innerText = "新密码至少6位！"; return; }
        if(newPwd !== newPwd2){ tips.className = "tips error"; tips.innerText = "两次密码不一致！"; return; }
        const res = await fetch(`${API_BASE_URL}/saveConfig`, {
            method: 'POST',headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'pwd', value: newPwd })
        });
        const data = await res.json();
        if(data.success){
            globalData.pwd = newPwd;
            tips.className = "tips success";
            tips.innerText = "密码修改成功！下次登录请用新密码";
            document.getElementById("old-pwd").value = "";
            document.getElementById("new-pwd").value = "";
            document.getElementById("new-pwd2").value = "";
        }
    },
    insertTag: function(start, end = ""){
        const txt = document.getElementById("art-content");
        const s = txt.selectionStart;const e = txt.selectionEnd;const val = txt.value;
        txt.value = val.substring(0, s) + start + val.substring(s, e) + end + val.substring(e);
        txt.focus();document.getElementById("font-size").value = "";document.getElementById("font-color").value = "";
    },
    setTextBold: function(){this.insertTag("**", "**");},
    setTextItalic: function(){this.insertTag("*", "*");},
    setFontSize: function(size){if(size)this.insertTag(`<span style="font-size:${size}">`, "</span>");},
    setFontColor: function(color){if(color)this.insertTag(`<span style="color:${color}">`, "</span>");},
    insertCode: function(){this.insertTag("```\n", "\n```");},
    insertLink: function(){
        const link = prompt("请输入链接地址：");const text = prompt("请输入链接文字：");
        if(link) this.insertTag(`<a href="${link}" target="_blank">`, text||link);
    },
    insertImage: function(){
        const input = document.createElement("input");
        input.type = "file";input.accept = "image/*";
        input.onchange = (e) => {
            const reader = new FileReader();
            reader.onload = (res) => {
                this.insertTag(`<img src="${res.target.result}" style="max-width:100%;border-radius:4px;margin:10px 0;" alt="图片">`);
            };
            reader.readAsDataURL(e.target.files[0]);
        };
        input.click();
    },
    clearArt: function(){
        document.getElementById("art-title").value = "";document.getElementById("art-content").value = "";
        document.getElementById("art-top").checked = false;document.getElementById("art-private").checked = false;
        this.editId = "";
    },
    async saveArt(){
        const title = document.getElementById("art-title").value.trim();
        const content = document.getElementById("art-content").value.trim();
        if(!title || !content){alert("标题和内容不能为空！");return;}
        const article = {
            id: this.editId || Math.random().toString(36).slice(2, 8),
            title: title,content: content,
            top: document.getElementById("art-top").checked,
            private: document.getElementById("art-private").checked,
            time: new Date().toLocaleDateString().replace(/\//g, "-")
        };
        const isEdit = !!this.editId;
        const res = await fetch(`${API_BASE_URL}/saveArticle`, {
            method: 'POST',headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ article, isEdit })
        });
        const data = await res.json();
        if(data.success){
            alert(isEdit ? "编辑成功！" : "发布成功！");
            this.clearArt();
            await this.initGlobalData();
            this.loadArticleList();
        }
    },
    loadArticleList: function(){
        const articles = globalData.articles;
        const list = document.getElementById("art-list");
        if(!list) return;
        if(articles.length ===0){
            list.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:30px;">暂无文章，点击发布新文章</td></tr>';
            return;
        }
        list.innerHTML = "";
        articles.forEach(item => {
            const status = item.private ? '<span class="status-private">私密</span>' : '<span class="status-public">公开</span>';
            const top = item.top ? "🔝 " : "";
            list.innerHTML += `<tr>
                <td>${top}${item.title}</td><td>${status}</td><td>${item.time}</td>
                <td><button class="btn-edit" onclick="blog.editArt('${item.id}')">编辑</button>
                <button class="btn-del" onclick="blog.delArt('${item.id}')">删除</button></td></tr>`;
        });
    },
    editArt: function(id){
        const articles = globalData.articles;
        const art = articles.find(item => item.id === id);
        if(!art) return;
        this.editId = id;
        document.getElementById("art-title").value = art.title;
        document.getElementById("art-content").value = art.content;
        document.getElementById("art-top").checked = art.top;
        document.getElementById("art-private").checked = art.private;
        document.querySelectorAll("[data-panel]").forEach(el => el.classList.remove("active"));
        document.querySelector("[data-panel='write']").classList.add("active");
        document.querySelectorAll(".panel").forEach(el => el.classList.remove("active"));
        document.getElementById("write").classList.add("active");
    },
    async delArt(id){
        if(!confirm("确定删除？删除后无法恢复！")) return;
        const res = await fetch(`${API_BASE_URL}/deleteArticle`, {
            method: 'POST',headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const data = await res.json();
        if(data.success){
            await this.initGlobalData();
            this.loadArticleList();
        }
    },
    loadFrontArticles: function(){
        const articles = globalData.articles.filter(item=>!item.private);
        const list = document.querySelector(".article-list");
        if(!list) return;
        if(articles.length ===0){
            list.innerHTML = '<div style="text-align:center;color:#fff;padding:50px;">暂无公开文章</div>';
            return;
        }
        list.innerHTML = "";
        articles.forEach(item => {
            const top = item.top ? '<span class="top-tag">🔝</span>' : "";
            list.innerHTML += `<div class="post-card">
                <div class="post-title"><a href="./article.html?id=${item.id}">${top}${item.title}</a></div>
                <div class="post-meta">发布时间：${item.time} | 阅读量：${item.read||0} | 点赞数：${item.like||0}</div>
                <div class="post-excerpt">${item.content.length>160 ? item.content.slice(0,160)+'...' : item.content}</div>
                <a href="./article.html?id=${item.id}" class="post-read">阅读全文 →</a>
            </div>`;
        });
    },
    // 代码块一键复制
    copyCode: function(codeText) {
        const successTip = document.getElementById('copy-success');
        const errorTip = document.getElementById('copy-error');
        if (!successTip || !errorTip) return;
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(codeText).then(() => {this.showTip(successTip);}).catch(() => {this.copyFallback(codeText, successTip, errorTip);});
        } else {this.copyFallback(codeText, successTip, errorTip);}
    },
    copyFallback: function(codeText, successTip, errorTip) {
        const textArea = document.createElement("textarea");
        textArea.value = codeText;textArea.style.position = "absolute";
        textArea.style.left = "-9999px";textArea.style.opacity = 0;
        document.body.appendChild(textArea);textArea.select();
        try {const result = document.execCommand('copy');this.showTip(result ? successTip : errorTip);}
        catch (err) {this.showTip(errorTip);}
        document.body.removeChild(textArea);
    },
    showTip: function(tipDom) {
        tipDom.style.display = 'block';
        setTimeout(() => {tipDom.style.display = 'none';}, 2000);
    },
    addCopyBtn: function() {
        const preList = document.querySelectorAll('pre');
        preList.forEach(pre => {
            const oldBtn = pre.querySelector('.copy-btn');if(oldBtn)oldBtn.remove();
            const code = pre.querySelector('code');if(!code)return;
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';copyBtn.innerText = '复制代码';
            copyBtn.onclick = () => {this.copyCode(code.innerText);};
            pre.appendChild(copyBtn);
            copyBtn.style.position = 'absolute';copyBtn.style.top = '8px';copyBtn.style.right = '8px';
            copyBtn.style.background = '#3498db';copyBtn.style.color = '#fff';copyBtn.style.border = 'none';
            copyBtn.style.borderRadius = '4px';copyBtn.style.padding = '4px 8px';copyBtn.style.fontSize = '12px';
            copyBtn.style.cursor = 'pointer';copyBtn.style.opacity = '0';copyBtn.style.transition = 'opacity 0.3s';
            pre.onmouseenter = () => {copyBtn.style.opacity = '1';};
            pre.onmouseleave = () => {copyBtn.style.opacity = '0';};
        });
    },
    loadArticleDetail: function(){
        const id = new URLSearchParams(window.location.search).get('id');
        const articles = globalData.articles;
        const art = articles.find(item=>item.id === id);
        if(!art || !document.getElementById('art-content')){
            document.getElementById('art-content').innerHTML = '<div style="text-align:center;color:#fff;padding:50px;">文章不存在或已删除</div>';
            return;
        }
        // 显示点赞数和评论
        document.getElementById('art-title').innerText = art.title;
        document.getElementById('art-meta').innerText = `发布时间：${art.time} | 阅读量：${art.read||0} | 点赞数：${art.like||0}`;
        document.getElementById('like-count').innerText = art.like || 0;
        
        // 解析文章内容
        document.getElementById('art-content').innerHTML = art.content
            .replace(/```([\s\S]+?)```/g, function(match, code){
                return `<pre><code>${code.trim()}</code></pre>`;
            }).replace(/\*\*(.*?)\*\*/g,"<b>$1</b>").replace(/\*(.*?)\*/g,"<i>$1</i>").replace(/\n/g,"<br>");
        
        // 加载评论列表
        this.loadComments(art.comments || []);
        this.addCopyBtn();
    },
    // 新增：加载评论列表
    loadComments: function(comments){
        const commentList = document.getElementById('comment-list');
        commentList.innerHTML = '';
        if(comments.length === 0){
            commentList.innerHTML = '<div style="text-align:center;padding:20px;color:#999;">暂无评论，快来抢沙发~</div>';
            return;
        }
        comments.forEach(comment => {
            commentList.innerHTML += `<div class='comment-item'><div class='comment-name'>${comment.name}</div><div class='comment-time'>${comment.time}</div><div class='comment-text'>${comment.content}</div></div>`;
        });
    },
    checkLogin: function(){
        if(window.location.pathname.includes('admin/') && !localStorage.getItem('blog_admin')){
            window.location.href='../login.html';
        }
    },
    logout: function(){
        localStorage.removeItem('blog_admin');
        window.location.href='../login.html';
    },
    initTab: function(){
        document.querySelectorAll('[data-panel]').forEach(el=>{
            el.onclick=function(){
                document.querySelectorAll('[data-panel]').forEach(e=>e.classList.remove('active'));
                this.classList.add('active');
                document.querySelectorAll('.panel').forEach(e=>e.classList.remove('active'));
                document.getElementById(this.getAttribute('data-panel')).classList.add('active');
            };
        });
    },
    async init(){
        await this.initGlobalData();
        this.initTime();setInterval(()=>this.initTime(),1000);
        if(window.location.pathname.includes('admin/')){
            this.checkLogin();this.initBg();this.initColorList();this.initAbout();this.loadArticleList();this.initTab();
        }else if(window.location.pathname.includes('article.html')){
            this.initBg();this.loadArticleDetail();
        }else if(window.location.pathname.includes('about.html')){
            this.initBg();this.initAbout();
        }else{
            this.initBg();this.loadFrontArticles();
        }
    }
};

// ===== 改造点赞函数：调用后端接口，持久化点赞数 =====
async function articleLike(){
    const id = new URLSearchParams(window.location.search).get('id');
    const res = await fetch(`${API_BASE_URL}/updateLike`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
    const data = await res.json();
    if(data.success){
        document.getElementById('like-count').innerText = data.like;
        alert('感谢点赞 ❤️');
        // 刷新全局数据
        await blog.initGlobalData();
    }else{
        alert('点赞失败，请重试！');
    }
}

// ===== 改造评论函数：调用后端接口，持久化评论 =====
async function submitComment(){
    const id = new URLSearchParams(window.location.search).get('id');
    const name=document.getElementById('comment-name').value.trim();
    const content=document.getElementById('comment-content').value.trim();
    if(!name||!content){alert('昵称和留言不能为空！');return;}
    
    const res = await fetch(`${API_BASE_URL}/addComment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, content })
    });
    const data = await res.json();
    if(data.success){
        // 清空输入框
        document.getElementById('comment-name').value='';
        document.getElementById('comment-content').value='';
        // 刷新评论列表
        blog.loadComments(data.comments);
        // 刷新全局数据
        await blog.initGlobalData();
    }else{
        alert('评论失败，请重试！');
    }
}

// 登录逻辑
async function login(){
    const inputPwd = document.getElementById('pwd').value.trim();
    await blog.initGlobalData();
    const savedPwd = globalData.pwd || "abc789..";
    if(inputPwd === savedPwd){
        localStorage.setItem('blog_admin', 'true');
        window.location.href = './admin/';
    }else{
        document.getElementById('tips').innerText = '密码错误！';
    }
}

window.onload = function(){blog.init();};
