<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
$baseDir = __DIR__.'/data/';
!is_dir($baseDir) && mkdir($baseDir,0777,true);
$artFile = $baseDir.'articles.json';
$cfgFile = $baseDir.'config.json';
$pwdFile = $baseDir.'pwd.json';

// 初始化默认文件
!file_exists($artFile) && file_put_contents($artFile,json_encode([],JSON_UNESCAPED_UNICODE));
!file_exists($cfgFile) && file_put_contents($cfgFile,json_encode(['bgStyle'=>'s1','about'=>'你好，欢迎来到我的个人博客！'],JSON_UNESCAPED_UNICODE));
!file_exists($pwdFile) && file_put_contents($pwdFile,json_encode(['pwd'=>'abc789..'],JSON_UNESCAPED_UNICODE));

$action = $_GET['action'] ?? '';
$result = ['code'=>200,'msg'=>'success','data'=>[]];

// 文章相关：增删改查
if($action == 'get_articles'){
    $data = json_decode(file_get_contents($artFile),true);
    $result['data'] = $data;
}
else if($action == 'save_article'){
    $art = json_decode(file_get_contents('php://input'),true);
    $articles = json_decode(file_get_contents($artFile),true);
    if($art['id']){
        foreach($articles as $k=>$v){
            if($v['id']==$art['id']){$articles[$k]=$art;break;}
        }
    }else{
        $art['id'] = substr(md5(microtime()),0,8);
        $art['time'] = date('Y-m-d');
        $art['read'] = 0;
        array_unshift($articles,$art);
    }
    file_put_contents($artFile,json_encode($articles,JSON_UNESCAPED_UNICODE));
    $result['data'] = $art;
}
else if($action == 'del_article'){
    $id = $_POST['id'];
    $articles = json_decode(file_get_contents($artFile),true);
    $articles = array_filter($articles,function($v)use($id){return $v['id']!=$id;});
    file_put_contents($artFile,json_encode(array_values($articles),JSON_UNESCAPED_UNICODE));
}

// 配置相关：背景色+关于我
else if($action == 'get_config'){
    $data = json_decode(file_get_contents($cfgFile),true);
    $result['data'] = $data;
}
else if($action == 'save_config'){
    $cfg = json_decode(file_get_contents('php://input'),true);
    $oldCfg = json_decode(file_get_contents($cfgFile),true);
    $newCfg = array_merge($oldCfg,$cfg);
    file_put_contents($cfgFile,json_encode($newCfg,JSON_UNESCAPED_UNICODE));
    $result['data'] = $newCfg;
}

// 密码相关
else if($action == 'get_pwd'){
    $data = json_decode(file_get_contents($pwdFile),true);
    $result['data'] = $data;
}
else if($action == 'save_pwd'){
    $pwd = json_decode(file_get_contents('php://input'),true);
    file_put_contents($pwdFile,json_encode($pwd,JSON_UNESCAPED_UNICODE));
    $result['data'] = $pwd;
}
else{
    $result['code']=400;$result['msg']='无效请求';
}
echo json_encode($result,JSON_UNESCAPED_UNICODE);
exit;
