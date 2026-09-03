# Gesture Christmas Tree

一个手势控制的 3D 粒子圣诞树复刻版。

## 交互
- 握拳：粒子聚合成圣诞树，并可通过移动手掌旋转
- 张开手掌：粒子散开成星尘
- 1 根手指：切换颜色主题
- 2 根手指：开启 / 关闭飘雪
- 3 根手指：触发烟花

## 技术
- Three.js 粒子与 3D 场景
- MediaPipe Hands 浏览器端手势识别
- 纯静态 HTML + JavaScript，可直接使用 GitHub Pages

## 本地运行
由于摄像头 API 对安全上下文有要求，建议通过 localhost 启动静态服务器，而不是直接双击 `index.html`。

```bash
python -m http.server 8080
```

然后访问 `http://localhost:8080`。

## 部署
GitHub Pages 使用 HTTPS，因此摄像头权限可以正常工作。把 Pages 的发布源指向本分支根目录即可。

## Credits
视觉与交互方向参考了 `fuguther/gesture-christmas-tree-2`（MIT License），本分支使用独立实现方式重构为纯静态版本。