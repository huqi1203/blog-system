<?php
/**
 * Blog System API v2 - Enhanced Version
 * Features: JWT Auth, Categories, Tags, Comments, Statistics
 */

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Configuration
$baseDir = __DIR__.'/data/';
$jwtSecret = 'blog-system-secret-key-2024'; // Change in production
$tokenExpiry = 86400 * 7; // 7 days

// Ensure data directory exists
if (!is_dir($baseDir)) {
    mkdir($baseDir, 0777, true);
}

// File paths
$files = [
    'articles' => $baseDir . 'articles.json',
    'config' => $baseDir . 'config.json',
    'users' => $baseDir . 'users.json',
    'comments' => $baseDir . 'comments.json',
    'categories' => $baseDir . 'categories.json',
    'tags' => $baseDir . 'tags.json',
    'stats' => $baseDir . 'stats.json'
];

// Initialize files with default data
function initFiles($files) {
    $defaults = [
        'articles' => [],
        'config' => [
            'siteName' => '我的博客',
            'siteDescription' => '记录生活，分享技术',
            'bgStyle' => 'gradient',
            'theme' => 'light',
            'about' => '你好，这是我的博客系统！',
            'footer' => '© 2024 Blog System. All rights reserved.',
            'allowComments' => true,
            'requireApproval' => false
        ],
        'users' => [
            [
                'id' => 'admin',
                'username' => 'admin',
                'password' => password_hash('admin123', PASSWORD_DEFAULT),
                'role' => 'admin',
                'createdAt' => date('Y-m-d H:i:s')
            ]
        ],
        'comments' => [],
        'categories' => [
            ['id' => 'tech', 'name' => '技术', 'description' => '技术文章', 'icon' => '💻'],
            ['id' => 'life', 'name' => '生活', 'description' => '生活随笔', 'icon' => '🌟'],
            ['id' => 'tutorial', 'name' => '教程', 'description' => '教程分享', 'icon' => '📚']
        ],
        'tags' => [],
        'stats' => [
            'views' => 0,
            'articleViews' => [],
            'dailyVisits' => []
        ]
    ];
    
    foreach ($files as $key => $file) {
        if (!file_exists($file)) {
            file_put_contents($file, json_encode($defaults[$key] ?? [], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        }
    }
}

initFiles($files);

// Helper Functions
function getJson($file) {
    $content = file_get_contents($file);
    return json_decode($content, true) ?: [];
}

function saveJson($file, $data) {
    file_put_contents($file, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}

function generateId() {
    return substr(str_shuffle('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 12);
}

// JWT Functions
function generateJWT($payload, $secret) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['iat'] = time();
    $payload['exp'] = time() + (86400 * 7);
    
    $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));
    
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, $secret, true);
    $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64Header . "." . $base64Payload . "." . $base64Signature;
}

function verifyJWT($token, $secret) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
    if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
        return false;
    }
    
    $signature = hash_hmac('sha256', $parts[0] . "." . $parts[1], $secret, true);
    $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return hash_equals($base64Signature, $parts[2]) ? $payload : false;
}

function getAuthUser() {
    global $jwtSecret;
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? '';
    
    if (preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
        return verifyJWT($matches[1], $jwtSecret);
    }
    return false;
}

function requireAuth() {
    $user = getAuthUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['code' => 401, 'msg' => '未授权，请先登录']);
        exit;
    }
    return $user;
}

function requireAdmin() {
    $user = requireAuth();
    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['code' => 403, 'msg' => '权限不足']);
        exit;
    }
    return $user;
}

// Statistics Tracking
function trackView($articleId = null) {
    global $files;
    $stats = getJson($files['stats']);
    $today = date('Y-m-d');
    
    $stats['views']++;
    
    if ($articleId) {
        if (!isset($stats['articleViews'][$articleId])) {
            $stats['articleViews'][$articleId] = 0;
        }
        $stats['articleViews'][$articleId]++;
    }
    
    if (!isset($stats['dailyVisits'][$today])) {
        $stats['dailyVisits'][$today] = 0;
    }
    $stats['dailyVisits'][$today]++;
    
    // Keep only last 30 days
    $stats['dailyVisits'] = array_slice($stats['dailyVisits'], -30, null, true);
    
    saveJson($files['stats'], $stats);
}

// Request Body
$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';
$result = ['code' => 200, 'msg' => 'success', 'data' => null];

// Router
try {
    switch ($action) {
        // ==================== AUTH ====================
        case 'login':
            $username = $input['username'] ?? '';
            $password = $input['password'] ?? '';
            
            $users = getJson($files['users']);
            $user = null;
            foreach ($users as $u) {
                if ($u['username'] === $username) {
                    $user = $u;
                    break;
                }
            }
            
            if ($user && password_verify($password, $user['password'])) {
                $token = generateJWT([
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'role' => $user['role']
                ], $jwtSecret);
                
                $result['data'] = [
                    'token' => $token,
                    'user' => [
                        'id' => $user['id'],
                        'username' => $user['username'],
                        'role' => $user['role']
                    ]
                ];
            } else {
                $result['code'] = 401;
                $result['msg'] = '用户名或密码错误';
            }
            break;
            
        case 'register':
            $username = $input['username'] ?? '';
            $password = $input['password'] ?? '';
            
            if (strlen($username) < 3 || strlen($password) < 6) {
                $result['code'] = 400;
                $result['msg'] = '用户名至少3位，密码至少6位';
                break;
            }
            
            $users = getJson($files['users']);
            foreach ($users as $u) {
                if ($u['username'] === $username) {
                    $result['code'] = 400;
                    $result['msg'] = '用户名已存在';
                    break 2;
                }
            }
            
            $newUser = [
                'id' => generateId(),
                'username' => $username,
                'password' => password_hash($password, PASSWORD_DEFAULT),
                'role' => 'user',
                'createdAt' => date('Y-m-d H:i:s')
            ];
            
            $users[] = $newUser;
            saveJson($files['users'], $users);
            
            $result['msg'] = '注册成功';
            break;
            
        case 'me':
            $user = requireAuth();
            $result['data'] = $user;
            break;
            
        // ==================== ARTICLES ====================
        case 'get_articles':
            trackView();
            $articles = getJson($files['articles']);
            $category = $_GET['category'] ?? null;
            $tag = $_GET['tag'] ?? null;
            $search = $_GET['search'] ?? null;
            $page = intval($_GET['page'] ?? 1);
            $limit = intval($_GET['limit'] ?? 10);
            
            // Filter
            if ($category) {
                $articles = array_filter($articles, fn($a) => ($a['category'] ?? '') === $category);
            }
            if ($tag) {
                $articles = array_filter($articles, fn($a) => in_array($tag, $a['tags'] ?? []));
            }
            if ($search) {
                $articles = array_filter($articles, fn($a) => 
                    stripos($a['title'] ?? '', $search) !== false || 
                    stripos($a['content'] ?? '', $search) !== false
                );
            }
            
            // Sort by time desc
            usort($articles, fn($a, $b) => strtotime($b['time'] ?? 0) - strtotime($a['time'] ?? 0));
            
            $total = count($articles);
            $start = ($page - 1) * $limit;
            $articles = array_slice($articles, $start, $limit);
            
            // Add view count
            $stats = getJson($files['stats']);
            foreach ($articles as &$article) {
                $article['views'] = $stats['articleViews'][$article['id']] ?? 0;
                $article['commentCount'] = count(array_filter(
                    getJson($files['comments']),
                    fn($c) => $c['articleId'] === $article['id'] && ($c['approved'] ?? true)
                ));
            }
            
            $result['data'] = [
                'articles' => array_values($articles),
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ]
            ];
            break;
            
        case 'get_article':
            $id = $_GET['id'] ?? '';
            $articles = getJson($files['articles']);
            $article = null;
            foreach ($articles as $a) {
                if ($a['id'] === $id) {
                    $article = $a;
                    break;
                }
            }
            
            if ($article) {
                trackView($id);
                $stats = getJson($files['stats']);
                $article['views'] = $stats['articleViews'][$id] ?? 0;
                $article['comments'] = array_values(array_filter(
                    getJson($files['comments']),
                    fn($c) => $c['articleId'] === $id && ($c['approved'] ?? true)
                ));
                $result['data'] = $article;
            } else {
                $result['code'] = 404;
                $result['msg'] = '文章不存在';
            }
            break;
            
        case 'save_article':
            requireAdmin();
            $art = $input;
            $articles = getJson($files['articles']);
            
            if (!empty($art['id'])) {
                // Update
                $found = false;
                foreach ($articles as $k => $v) {
                    if ($v['id'] === $art['id']) {
                        $art['updatedAt'] = date('Y-m-d H:i:s');
                        $art['createdAt'] = $v['createdAt'] ?? $v['time'];
                        $articles[$k] = $art;
                        $found = true;
                        break;
                    }
                }
                if (!$found) {
                    $result['code'] = 404;
                    $result['msg'] = '文章不存在';
                    break;
                }
            } else {
                // Create
                $art['id'] = generateId();
                $art['createdAt'] = date('Y-m-d H:i:s');
                $art['updatedAt'] = $art['createdAt'];
                $art['time'] = date('Y-m-d');
                $art['read'] = 0;
                $articles[] = $art;
            }
            
            // Update tags
            if (!empty($art['tags'])) {
                $allTags = getJson($files['tags']);
                foreach ($art['tags'] as $tag) {
                    $found = false;
                    foreach ($allTags as &$t) {
                        if ($t['name'] === $tag) {
                            $t['count'] = ($t['count'] ?? 0) + 1;
                            $found = true;
                            break;
                        }
                    }
                    if (!$found) {
                        $allTags[] = ['name' => $tag, 'count' => 1];
                    }
                }
                saveJson($files['tags'], $allTags);
            }
            
            saveJson($files['articles'], $articles);
            $result['data'] = $art;
            break;
            
        case 'del_article':
            requireAdmin();
            $id = $input['id'] ?? $_POST['id'] ?? '';
            $articles = getJson($files['articles']);
            $articles = array_filter($articles, fn($v) => $v['id'] !== $id);
            saveJson($files['articles'], array_values($articles));
            
            // Delete related comments
            $comments = getJson($files['comments']);
            $comments = array_filter($comments, fn($c) => $c['articleId'] !== $id);
            saveJson($files['comments'], array_values($comments));
            
            $result['msg'] = '删除成功';
            break;
            
        // ==================== CATEGORIES ====================
        case 'get_categories':
            $result['data'] = getJson($files['categories']);
            break;
            
        case 'save_category':
            requireAdmin();
            $cat = $input;
            $categories = getJson($files['categories']);
            
            if (!empty($cat['id'])) {
                foreach ($categories as $k => $v) {
                    if ($v['id'] === $cat['id']) {
                        $categories[$k] = $cat;
                        break;
                    }
                }
            } else {
                $cat['id'] = generateId();
                $categories[] = $cat;
            }
            
            saveJson($files['categories'], $categories);
            $result['data'] = $cat;
            break;
            
        case 'del_category':
            requireAdmin();
            $id = $input['id'] ?? '';
            $categories = getJson($files['categories']);
            $categories = array_filter($categories, fn($c) => $c['id'] !== $id);
            saveJson($files['categories'], array_values($categories));
            $result['msg'] = '删除成功';
            break;
            
        // ==================== TAGS ====================
        case 'get_tags':
            $result['data'] = getJson($files['tags']);
            break;
            
        // ==================== COMMENTS ====================
        case 'get_comments':
            $articleId = $_GET['articleId'] ?? null;
            $comments = getJson($files['comments']);
            
            if ($articleId) {
                $comments = array_filter($comments, fn($c) => $c['articleId'] === $articleId);
            }
            
            // Sort by time desc
            usort($comments, fn($a, $b) => strtotime($b['createdAt'] ?? 0) - strtotime($a['createdAt'] ?? 0));
            
            $result['data'] = array_values($comments);
            break;
            
        case 'add_comment':
            $cfg = getJson($files['config']);
            if (!($cfg['allowComments'] ?? true)) {
                $result['code'] = 403;
                $result['msg'] = '评论已关闭';
                break;
            }
            
            $comment = $input;
            if (empty($comment['articleId']) || empty($comment['content'])) {
                $result['code'] = 400;
                $result['msg'] = '参数错误';
                break;
            }
            
            $comments = getJson($files['comments']);
            $newComment = [
                'id' => generateId(),
                'articleId' => $comment['articleId'],
                'author' => $comment['author'] ?? '匿名用户',
                'email' => $comment['email'] ?? '',
                'content' => htmlspecialchars($comment['content']),
                'createdAt' => date('Y-m-d H:i:s'),
                'approved' => !($cfg['requireApproval'] ?? false)
            ];
            
            $comments[] = $newComment;
            saveJson($files['comments'], $comments);
            
            $result['data'] = $newComment;
            $result['msg'] = $newComment['approved'] ? '评论成功' : '评论已提交，等待审核';
            break;
            
        case 'approve_comment':
            requireAdmin();
            $id = $input['id'] ?? '';
            $comments = getJson($files['comments']);
            
            foreach ($comments as &$c) {
                if ($c['id'] === $id) {
                    $c['approved'] = true;
                    break;
                }
            }
            
            saveJson($files['comments'], $comments);
            $result['msg'] = '审核通过';
            break;
            
        case 'del_comment':
            requireAdmin();
            $id = $input['id'] ?? '';
            $comments = getJson($files['comments']);
            $comments = array_filter($comments, fn($c) => $c['id'] !== $id);
            saveJson($files['comments'], array_values($comments));
            $result['msg'] = '删除成功';
            break;
            
        // ==================== CONFIG ====================
        case 'get_config':
            $data = getJson($files['config']);
            $result['data'] = $data;
            break;
            
        case 'save_config':
            requireAdmin();
            $cfg = $input;
            $oldCfg = getJson($files['config']);
            $newCfg = array_merge($oldCfg, $cfg);
            saveJson($files['config'], $newCfg);
            $result['data'] = $newCfg;
            break;
            
        // ==================== STATISTICS ====================
        case 'get_stats':
            requireAdmin();
            $stats = getJson($files['stats']);
            $articles = getJson($files['articles']);
            $comments = getJson($files['comments']);
            
            // Calculate additional stats
            $totalComments = count($comments);
            $pendingComments = count(array_filter($comments, fn($c) => !($c['approved'] ?? true)));
            
            // Top articles by views
            $topArticles = [];
            foreach ($stats['articleViews'] as $id => $views) {
                foreach ($articles as $a) {
                    if ($a['id'] === $id) {
                        $topArticles[] = ['id' => $id, 'title' => $a['title'], 'views' => $views];
                        break;
                    }
                }
            }
            usort($topArticles, fn($a, $b) => $b['views'] - $a['views']);
            $topArticles = array_slice($topArticles, 0, 5);
            
            $result['data'] = [
                'totalViews' => $stats['views'],
                'totalArticles' => count($articles),
                'totalComments' => $totalComments,
                'pendingComments' => $pendingComments,
                'dailyVisits' => $stats['dailyVisits'],
                'topArticles' => $topArticles
            ];
            break;
            
        // ==================== USERS ====================
        case 'get_users':
            requireAdmin();
            $users = getJson($files['users']);
            // Remove password from output
            foreach ($users as &$u) {
                unset($u['password']);
            }
            $result['data'] = $users;
            break;
            
        case 'del_user':
            requireAdmin();
            $id = $input['id'] ?? '';
            if ($id === 'admin') {
                $result['code'] = 400;
                $result['msg'] = '不能删除管理员账号';
                break;
            }
            $users = getJson($files['users']);
            $users = array_filter($users, fn($u) => $u['id'] !== $id);
            saveJson($files['users'], array_values($users));
            $result['msg'] = '删除成功';
            break;
            
        default:
            $result['code'] = 400;
            $result['msg'] = '未知操作: ' . $action;
    }
} catch (Exception $e) {
    $result['code'] = 500;
    $result['msg'] = '服务器错误: ' . $e->getMessage();
}

echo json_encode($result, JSON_UNESCAPED_UNICODE);
exit;
