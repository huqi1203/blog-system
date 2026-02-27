#!/bin/bash
# Browser Control Skill - 快捷命令

COMMAND=$1
URL=$2

case $COMMAND in
  open|打开)
    openclaw browser --browser-profile mydebug open "$URL"
    ;;
  screenshot|截图)
    openclaw browser --browser-profile mydebug screenshot
    ;;
  click|点击)
    openclaw browser --browser-profile mydebug act --click "$URL"
    ;;
  type|输入)
    openclaw browser --browser-profile mydebug act --type "$URL"
    ;;
  scroll|滚动)
    openclaw browser --browser-profile mydebug act --scroll "$URL"
    ;;
  *)
    echo "用法: browser [open|screenshot|click|type|scroll] [参数]"
    echo ""
    echo "示例:"
    echo "  browser open https://github.com"
    echo "  browser screenshot"
    echo "  browser click '登录按钮'"
    ;;
esac
